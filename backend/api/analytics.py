"""Analytics API for admin dashboard metrics and operational summaries."""

import asyncio
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.config import settings
from backend.core.forecast_engine import forecast_engine
from backend.core.fraud_model_service import fraud_model_service
from backend.core.risk_model_service import risk_model_service
from backend.core.session_auth import require_admin_session
from backend.core.trigger_scheduler import trigger_scheduler
from backend.database import async_session_factory, get_db
from backend.db.models import AuditLog, Claim, Event, Payout, Policy, Worker, WorkerActivity
from backend.utils.time import utc_now_naive

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


async def _forecast_city_snapshot(city: str, horizon_hours: int) -> dict:
    async with async_session_factory() as forecast_db:
        return await forecast_engine.forecast_city(forecast_db, city, horizon_hours=horizon_hours)


def forecast_band(score: float) -> str:
    if score < 0.3:
        return "low"
    if score < 0.55:
        return "guarded"
    if score < 0.75:
        return "elevated"
    return "critical"


def _humanize_label(value: str | None) -> str:
    if not value:
        return "signal alignment"
    return " ".join(part.capitalize() for part in str(value).split("_") if part)


def _review_flag_label(value: str | None) -> str:
    mapping = {
        "movement": "movement anomaly",
        "pre_activity": "weak pre-event activity",
        "timing": "policy timing risk",
        "duplicate": "duplicate claim pressure",
        "cluster": "cluster fraud pressure",
        "income_inflation": "income inflation pressure",
        "device": "device risk",
    }
    if value in mapping:
        return mapping[value]
    return _humanize_label(value).lower()


def _is_zero_touch_approved(claim: Claim) -> bool:
    return claim.status == "approved" and not claim.reviewed_by


def _review_driver_labels(claim: Claim) -> list[str]:
    breakdown = claim.decision_breakdown if isinstance(claim.decision_breakdown, dict) else {}
    labels: list[str] = []
    seen: set[str] = set()

    def add_label(value: str | None) -> None:
        if not value:
            return
        normalized = str(value).strip()
        if not normalized or normalized in seen:
            return
        seen.add(normalized)
        labels.append(normalized)

    add_label(breakdown.get("primary_reason"))
    fraud_model = breakdown.get("fraud_model") if isinstance(breakdown.get("fraud_model"), dict) else {}
    top_factors = fraud_model.get("top_factors") if isinstance(fraud_model.get("top_factors"), list) else []
    for factor in top_factors[:3]:
        add_label(factor.get("label"))
    inputs = breakdown.get("inputs") if isinstance(breakdown.get("inputs"), dict) else {}
    flags = inputs.get("fraud_flags") if isinstance(inputs.get("fraud_flags"), list) else []
    for flag in flags[:3]:
        add_label(_review_flag_label(flag))
    event_confidence = inputs.get("event_confidence")
    try:
        if event_confidence is not None and float(event_confidence) <= 0.75:
            add_label("event confidence")
    except (TypeError, ValueError):
        pass
    if not labels:
        add_label("signal alignment")
    return labels


def _incident_key(claim: Claim) -> str:
    zone = claim.event.zone if claim.event else "zone"
    created_at = claim.created_at.isoformat() if claim.created_at else "unknown"
    bucket = created_at[:13]
    return f"{claim.worker_id}|{zone}|{bucket}"


def _review_insights(driver_counts: dict[str, int], incident_labels: list[set[str]], total_incidents: int) -> dict:
    weak_signal_labels = {
        "movement anomaly",
        "weak pre-event activity",
        "event confidence",
        "signal alignment requires review",
    }
    low_trust_count = sum(1 for labels in incident_labels if "worker trust score" in labels)
    weak_signal_count = sum(1 for labels in incident_labels if labels & weak_signal_labels)
    return {
        "weak_signal_overlap_share": round((weak_signal_count / max(1, total_incidents)) * 100),
        "low_trust_share": round((low_trust_count / max(1, total_incidents)) * 100),
    }


def _summarize_review_drivers(claims: list[Claim], *, source: str, window_hours: int | None) -> dict:
    driver_counts: dict[str, int] = {}
    seen_incidents: set[str] = set()
    total_incidents = 0
    incident_labels: list[set[str]] = []

    for claim in claims:
        incident_key = _incident_key(claim)
        if incident_key in seen_incidents:
            continue
        seen_incidents.add(incident_key)
        total_incidents += 1
        labels = set(_review_driver_labels(claim))
        incident_labels.append(labels)
        for label in labels:
            driver_counts[label] = driver_counts.get(label, 0) + 1

    drivers = [
        {
            "label": label,
            "count": count,
            "share": round((count / max(1, total_incidents)) * 100),
        }
        for label, count in sorted(driver_counts.items(), key=lambda item: (-item[1], item[0]))
    ][:3]

    return {
        "source": source,
        "window_hours": window_hours,
        "total_incidents": total_incidents,
        "drivers": drivers,
        "insights": _review_insights(driver_counts, incident_labels, total_incidents),
    }


def _build_review_driver_summary(recent_claims: list[Claim], active_queue_claims: list[Claim], recent_window_hours: int) -> dict:
    recent_summary = _summarize_review_drivers(
        recent_claims,
        source="recent_activity",
        window_hours=recent_window_hours,
    )
    if recent_summary["total_incidents"] > 0:
        return recent_summary
    return _summarize_review_drivers(
        active_queue_claims,
        source="active_queue",
        window_hours=None,
    )


@router.get("/admin-overview")
async def get_admin_overview(
    days: int = 14,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin_session),
):
    now = utc_now_naive()
    cutoff = now - timedelta(days=days)
    recent_activity_cutoff = now - timedelta(hours=6)
    review_driver_cutoff = now - timedelta(hours=1)

    active_policy_rows = (
        await db.execute(
            select(Policy.plan_name, Policy.weekly_premium, Worker.city)
            .join(Worker, Worker.id == Policy.worker_id)
            .where(
                Policy.status == "active",
                Policy.activates_at <= now,
                Policy.expires_at >= now,
            )
        )
    ).all()

    policies_by_plan: dict[str, int] = {}
    policies_by_city: dict[str, int] = {}
    premiums_in_force = 0.0
    for plan_name, weekly_premium, city in active_policy_rows:
        policies_by_plan[plan_name] = policies_by_plan.get(plan_name, 0) + 1
        if city:
            policies_by_city[city] = policies_by_city.get(city, 0) + 1
        premiums_in_force += float(weekly_premium or 0)

    payouts_total = (
        await db.execute(
            select(func.coalesce(func.sum(Payout.amount), 0)).where(Payout.initiated_at >= cutoff)
        )
    ).scalar_one()
    payouts_total = float(payouts_total or 0)

    recent_claims = (
        await db.execute(select(Claim).where(Claim.created_at >= cutoff))
    ).scalars().all()
    auto_approved_count = 0
    delayed_count = 0
    for claim in recent_claims:
        if claim.status == "delayed":
            delayed_count += 1
        if _is_zero_touch_approved(claim):
            auto_approved_count += 1
    claim_total = len(recent_claims)
    recent_review_claims = (
        await db.execute(
            select(Claim)
            .options(selectinload(Claim.event))
            .where(Claim.status == "delayed", Claim.created_at >= review_driver_cutoff)
        )
    ).scalars().all()
    delayed_queue_claims = (
        await db.execute(
            select(Claim)
            .options(selectinload(Claim.event))
            .where(Claim.status == "delayed")
        )
    ).scalars().all()

    active_workers = (
        await db.execute(select(func.count(Worker.id)).where(Worker.status == "active"))
    ).scalar_one()
    recent_activity_points = (
        await db.execute(
            select(func.count(WorkerActivity.id)).where(WorkerActivity.recorded_at >= recent_activity_cutoff)
        )
    ).scalar_one()
    worker_activity_index = round((recent_activity_points / max(1, active_workers)) * 10, 1)

    recent_duplicate_logs = (
        await db.execute(
            select(AuditLog)
            .where(
                AuditLog.created_at >= cutoff,
                AuditLog.action.in_(["duplicate_detected", "event_extended"]),
            )
            .order_by(AuditLog.created_at.desc())
            .limit(12)
        )
    ).scalars().all()

    duplicate_claim_log = [
        {
            "id": str(log.id),
            "entity_type": log.entity_type,
            "entity_id": str(log.entity_id),
            "action": log.action,
            "details": log.details or {},
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in recent_duplicate_logs
    ]

    active_events_by_city = (
        await db.execute(
            select(Event.city, func.count(Event.id))
            .where(Event.status == "active")
            .group_by(Event.city)
        )
    ).all()
    active_city_counts = {city: count for city, count in active_events_by_city}

    cities = list(settings.CITY_RISK_PROFILES.keys())
    city_forecasts = await asyncio.gather(*[_forecast_city_snapshot(city, 168) for city in cities])

    forecast = []
    for city, city_forecast in zip(cities, city_forecasts):
        base = float(settings.CITY_RISK_PROFILES[city]["base_risk"])
        city_score = round(
            sum(zone["projected_risk"] for zone in city_forecast["zones"]) / max(1, len(city_forecast["zones"])),
            3,
        )
        forecast.append(
            {
                "city": city,
                "base_risk": base,
                "active_incidents": active_city_counts.get(city, 0),
                "projected_risk": city_score,
                "band": forecast_band(city_score),
                "top_zone": city_forecast["zones"][0]["zone"] if city_forecast["zones"] else None,
                "model_version": city_forecast["zones"][0]["model_version"] if city_forecast["zones"] else "rule-based",
            }
        )

    return {
        "period_days": days,
        "active_policies_total": len(active_policy_rows),
        "active_policies_by_plan": policies_by_plan,
        "active_policies_by_city": policies_by_city,
        "premiums_in_force": round(premiums_in_force, 2),
        "payouts_in_window": round(payouts_total, 2),
        "loss_ratio": round((payouts_total / max(1.0, premiums_in_force)) * 100, 1),
        "worker_activity_index": worker_activity_index,
        "duplicate_claim_log": duplicate_claim_log,
        "scheduler": trigger_scheduler.state,
        "decision_health": {
            "claim_total": claim_total,
            "auto_approved": auto_approved_count,
            "auto_approval_rate": round((auto_approved_count / max(1, claim_total)) * 100, 1),
            "zero_touch_approvals": auto_approved_count,
            "zero_touch_rate": round((auto_approved_count / max(1, claim_total)) * 100, 1),
            "review_rate": round((delayed_count / max(1, claim_total)) * 100, 1),
        },
        "review_driver_summary": _build_review_driver_summary(recent_review_claims, delayed_queue_claims, recent_window_hours=1),
        "next_week_forecast": forecast,
    }


@router.get("/forecast")
async def get_forecast(
    city: str,
    horizon: int = 24,
    zone: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin_session),
):
    if zone:
        return {
            "forecast": await forecast_engine.forecast_zone(db, city.lower(), zone.lower(), horizon_hours=horizon)
        }
    return {"forecast": await forecast_engine.forecast_city(db, city.lower(), horizon_hours=horizon)}


@router.get("/zone-risk")
async def get_zone_risk(
    city: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin_session),
):
    return {"city": city.lower(), "zones": await forecast_engine.zone_risk(db, city.lower())}


@router.get("/models")
async def get_models(
    _: dict = Depends(require_admin_session),
):
    risk_info = risk_model_service.get_model_info()
    fraud_info = fraud_model_service.get_model_info()
    return {
        "models": {
            "risk_model": {
                "status": risk_info.get("status"),
                "version": risk_info.get("version"),
                "trained_at": risk_info.get("trained_at"),
                "r2_score": risk_info.get("metrics", {}).get("r2"),
                "mae": risk_info.get("metrics", {}).get("mae"),
                "rmse": risk_info.get("metrics", {}).get("rmse"),
                "model_type": risk_info.get("model_type"),
                "n_samples": risk_info.get("n_samples"),
                "fallback_used": risk_info.get("fallback_used"),
                "last_error": risk_info.get("last_error"),
            },
            "fraud_model": {
                "status": fraud_info.get("status"),
                "version": fraud_info.get("version"),
                "trained_at": fraud_info.get("trained_at"),
                "roc_auc": fraud_info.get("metrics", {}).get("roc_auc"),
                "average_precision": fraud_info.get("metrics", {}).get("average_precision"),
                "precision": fraud_info.get("metrics", {}).get("precision"),
                "recall": fraud_info.get("metrics", {}).get("recall"),
                "model_type": fraud_info.get("model_type"),
                "n_samples": fraud_info.get("n_samples"),
                "fallback_used": fraud_info.get("fallback_used"),
                "last_error": fraud_info.get("last_error"),
            },
            "forecast_engine": {
                "status": "active",
                "version": "forecast-v1",
                "fallback_active": not risk_model_service.model_available,
            },
        }
    }
