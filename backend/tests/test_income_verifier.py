"""Unit tests for payout calculation semantics."""

import pytest

from backend.core.income_verifier import income_verifier


@pytest.mark.asyncio
async def test_calculate_payout_uses_operating_cost_factor(monkeypatch):
    async def fake_verify_income(*args, **kwargs):
        return {
            "self_reported": 900,
            "platform_estimated": 880,
            "behavioral_estimated": 860,
            "weighted_income": 880,
            "city_avg": 900,
            "city_cap": 1350,
            "cap_applied": False,
            "final_daily_income": 880,
            "working_hours": 8,
            "income_per_hour": 110,
        }

    class PolicyStub:
        coverage_cap = 1000

    monkeypatch.setattr(income_verifier, "verify_income", fake_verify_income)
    payout = await income_verifier.calculate_payout(None, None, PolicyStub(), disruption_hours=2, event_hour=12)

    assert payout["income_per_hour"] == 110
    assert payout["operating_cost_factor"] == 0.85
    assert payout["net_income_per_hour"] == 93.5
    assert payout["raw_payout"] == 243.1
    assert payout["final_payout"] == 243.1
