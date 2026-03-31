"""Unit tests for core claim processor behavior."""

from datetime import timedelta
from decimal import Decimal

import pytest
from sqlalchemy import select

from backend.core.claim_processor import claim_processor
from backend.core.location_service import location_service
from backend.database import async_session_factory
from backend.db.models import AuditLog, Claim, Event, Policy, TrustScore, Worker
from backend.utils.time import utc_now_naive


async def create_worker_policy_event(phone: str = "+919777666555"):
    now = utc_now_naive()

    async with async_session_factory() as db:
        zone = await location_service.resolve_zone(db, "delhi", "south_delhi")
        worker = Worker(
            name="Processor Worker",
            phone=phone,
            city_id=zone.city_id,
            zone_id=zone.id,
            city="delhi",
            zone="south_delhi",
            platform="zomato",
            self_reported_income=Decimal("900"),
            working_hours=Decimal("9"),
            consent_given=True,
            consent_timestamp=now - timedelta(days=30),
            risk_score=Decimal("0.650"),
            status="active",
            created_at=now - timedelta(days=30),
        )
        db.add(worker)
        await db.flush()

        policy = Policy(
            worker_id=worker.id,
            plan_name="smart_protect",
            plan_display_name="Smart Protect",
            base_price=Decimal("39"),
            plan_factor=Decimal("1.5"),
            risk_score_at_purchase=Decimal("0.650"),
            weekly_premium=Decimal("39"),
            coverage_cap=Decimal("600"),
            triggers_covered=["rain", "traffic", "platform_outage"],
            status="active",
            purchased_at=now - timedelta(days=1),
            activates_at=now - timedelta(hours=1),
            expires_at=now + timedelta(days=6),
            created_at=now - timedelta(days=1),
        )
        db.add(policy)

        trust = TrustScore(
            worker_id=worker.id,
            score=Decimal("0.750"),
            total_claims=2,
            approved_claims=2,
            fraud_flags=0,
            account_age_days=30,
            device_stability=Decimal("0.950"),
            last_updated=now,
        )
        db.add(trust)

        event = Event(
            event_type="rain",
            zone_id=zone.id,
            zone="south_delhi",
            city="delhi",
            started_at=now - timedelta(minutes=15),
            severity=Decimal("1.500"),
            raw_value=Decimal("48.0"),
            threshold=Decimal("25.0"),
            disruption_score=Decimal("0.820"),
            event_confidence=Decimal("0.900"),
            api_source="mock_weather",
            status="active",
            metadata_json={"fired_triggers": ["rain", "traffic"]},
            created_at=now - timedelta(minutes=15),
            updated_at=now - timedelta(minutes=15),
        )
        db.add(event)
        await db.commit()
        return worker.id, policy.id, event.id


@pytest.mark.asyncio
async def test_process_worker_claim_returns_duplicate_for_existing_event_claim():
    worker_id, policy_id, event_id = await create_worker_policy_event("+919777666551")

    async with async_session_factory() as db:
        worker = await db.get(Worker, worker_id)
        policy = await db.get(Policy, policy_id)
        event = await db.get(Event, event_id)
        existing_claim = Claim(
            worker_id=worker.id,
            policy_id=policy.id,
            event_id=event.id,
            trigger_type=event.event_type,
            disruption_hours=Decimal("2.0"),
            status="approved",
            created_at=utc_now_naive(),
        )
        db.add(existing_claim)
        await db.commit()

        result = await claim_processor._process_worker_claim(
            db=db,
            worker=worker,
            policy=policy,
            event=event,
            disruption_score=0.82,
            event_confidence=0.9,
            trust_score=0.75,
            covered_triggers=["rain", "traffic"],
            fired_triggers=["rain", "traffic"],
        )
        await db.flush()

        duplicate_logs = (
            await db.execute(select(AuditLog).where(AuditLog.action == "duplicate_detected"))
        ).scalars().all()

    assert result["status"] == "duplicate"
    assert duplicate_logs


@pytest.mark.asyncio
async def test_process_worker_claim_creates_approved_claim_and_updates_trust(monkeypatch):
    worker_id, policy_id, event_id = await create_worker_policy_event("+919777666552")

    async def fake_fraud(*args, **kwargs):
        return {
            "raw_fraud_score": 0.1,
            "adjusted_fraud_score": 0.05,
            "flags": [],
            "is_high_risk": False,
        }

    def fake_decide(*args, **kwargs):
        return {
            "final_score": 0.91,
            "decision": "approved",
            "explanation": "Approved in test.",
            "breakdown": {},
            "inputs": {},
            "review_deadline": None,
        }

    async def fake_income(*args, **kwargs):
        return {
            "income_per_hour": 100,
            "peak_multiplier": 1.2,
            "raw_payout": 240,
            "final_payout": 240,
        }

    async def fake_payout(*args, **kwargs):
        return {"payout_id": "test-payout", "amount": 240, "status": "completed"}

    monkeypatch.setattr("backend.core.claim_processor.fraud_detector.compute_fraud_score", fake_fraud)
    monkeypatch.setattr("backend.core.claim_processor.decision_engine.decide", fake_decide)
    monkeypatch.setattr("backend.core.claim_processor.income_verifier.calculate_payout", fake_income)
    monkeypatch.setattr("backend.core.claim_processor.payout_executor.execute", fake_payout)

    async with async_session_factory() as db:
        worker = await db.get(Worker, worker_id)
        policy = await db.get(Policy, policy_id)
        event = await db.get(Event, event_id)

        result = await claim_processor._process_worker_claim(
            db=db,
            worker=worker,
            policy=policy,
            event=event,
            disruption_score=0.82,
            event_confidence=0.9,
            trust_score=0.75,
            covered_triggers=["rain", "traffic"],
            fired_triggers=["rain", "traffic"],
        )
        await db.commit()

        created_claim = (
            await db.execute(select(Claim).where(Claim.worker_id == worker.id, Claim.event_id == event.id))
        ).scalar_one()
        trust = (await db.execute(select(TrustScore).where(TrustScore.worker_id == worker.id))).scalar_one()

    assert result["status"] == "approved"
    assert result["payout_amount"] == 240
    assert created_claim.status == "approved"
    assert float(trust.score) > 0.75


@pytest.mark.asyncio
async def test_run_trigger_cycle_resets_scenario_even_on_failure(monkeypatch):
    calls = []

    def fake_set_scenario(name: str):
        calls.append(name)

    async def failing_zone(*args, **kwargs):
        raise RuntimeError("zone failure")

    monkeypatch.setattr(claim_processor, "_set_scenario", fake_set_scenario)
    monkeypatch.setattr(claim_processor, "_process_zone", failing_zone)

    async with async_session_factory() as db:
        with pytest.raises(RuntimeError, match="zone failure"):
            await claim_processor.run_trigger_cycle(
                db=db,
                city="delhi",
                zones=["south_delhi"],
                scenario="heavy_rain",
            )

    assert calls == ["heavy_rain", "normal"]
