"""
Tests for admin analytics endpoints.
"""

from datetime import datetime
from types import SimpleNamespace
from uuid import uuid4

import pytest

from backend.api.analytics import _build_review_driver_summary


def _claim_stub(*, created_at: datetime, primary_reason: str, worker_id=None, zone: str = "south_delhi"):
    return SimpleNamespace(
        worker_id=worker_id or uuid4(),
        created_at=created_at,
        decision_breakdown={"primary_reason": primary_reason},
        event=SimpleNamespace(zone=zone),
    )


def test_review_driver_summary_falls_back_to_active_queue_when_recent_window_is_empty():
    active_queue_claims = [
        _claim_stub(created_at=datetime(2026, 4, 3, 10, 0), primary_reason="movement anomaly", worker_id=uuid4()),
        _claim_stub(created_at=datetime(2026, 4, 3, 10, 5), primary_reason="worker trust score", worker_id=uuid4(), zone="east_delhi"),
    ]

    summary = _build_review_driver_summary([], active_queue_claims, recent_window_hours=1)

    assert summary["source"] == "active_queue"
    assert summary["total_incidents"] == 2
    assert summary["drivers"]
    assert summary["insights"]["weak_signal_overlap_share"] == 50
    assert summary["insights"]["low_trust_share"] == 50


def test_review_driver_summary_counts_multiple_labels_per_incident():
    claim = SimpleNamespace(
        worker_id=uuid4(),
        created_at=datetime(2026, 4, 3, 10, 0),
        decision_breakdown={
            "primary_reason": "movement anomaly",
            "fraud_model": {
                "top_factors": [
                    {"label": "movement anomaly"},
                    {"label": "weak pre-event activity"},
                ]
            },
            "inputs": {
                "fraud_flags": ["movement", "pre_activity"],
                "event_confidence": 0.72,
            },
        },
        event=SimpleNamespace(zone="south_delhi"),
    )

    summary = _build_review_driver_summary([], [claim], recent_window_hours=1)

    labels = {driver["label"] for driver in summary["drivers"]}
    assert "movement anomaly" in labels
    assert "weak pre-event activity" in labels
    assert "event confidence" in labels
    assert summary["insights"]["weak_signal_overlap_share"] == 100


@pytest.mark.asyncio
async def test_admin_overview_requires_admin_token(client):
    response = await client.get("/api/analytics/admin-overview")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_overview_returns_scheduler_and_forecast(client):
    login_response = await client.post(
        "/api/auth/admin/login",
        json={"username": "admin", "password": "rideshield-test-admin-password"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["token"]

    overview_response = await client.get(
        "/api/analytics/admin-overview",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert overview_response.status_code == 200
    data = overview_response.json()

    assert "scheduler" in data
    assert "decision_health" in data
    assert "zero_touch_rate" in data["decision_health"]
    assert "review_driver_summary" in data
    assert "drivers" in data["review_driver_summary"]
    assert "source" in data["review_driver_summary"]
    assert "insights" in data["review_driver_summary"]
    assert "next_week_forecast" in data
    assert isinstance(data["next_week_forecast"], list)


@pytest.mark.asyncio
async def test_models_endpoint_returns_status(client, admin_cookies):
    response = await client.get("/api/analytics/models", cookies=admin_cookies)
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "risk_model" in data["models"]
    assert "fraud_model" in data["models"]
    assert "roc_auc" in data["models"]["fraud_model"]
