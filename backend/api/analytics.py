"""Analytics API for admin dashboard metrics and operational summaries."""

from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings
from backend.core.forecast_engine import forecast_engine
from backend.core.risk_model_service import risk_model_service
from backend.core.session_auth import require_admin_session
from backend.core.trigger_scheduler import trigger_scheduler
from backend.database import get_db
from backend.db.models import AuditLog, Event, Payout, Policy, Worker, WorkerActivity
from backend.utils.time import utc_now_naive

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


def forecast_band(score: float) -> str:
    if score < 0.3:
        return "low"
    if score < 0.55:
        return "guarded"
    if score < 0.75:
        return "elevated"
    return "critical"


@router.get("/admin-overview")
async def get_admin_overview(
    days: int = 14,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin_session),
):
    now = utc_now_naive()
    cutoff = now - timedelta(days=days)
    recent_activity_cutoff = now - timedelta(hours=6)

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

    forecast = []
    for city in settings.CITY_RISK_PROFILES.keys():
        city_forecast = await forecast_engine.forecast_city(db, city, horizon_hours=168)
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
            "forecast_engine": {
                "status": "active",
                "version": "forecast-v1",
                "fallback_active": not risk_model_service.model_available,
            },
        }
    }
