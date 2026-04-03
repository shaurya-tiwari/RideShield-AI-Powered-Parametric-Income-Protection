"""Tests for the forecast engine and analytics forecast endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient

from backend.core.forecast_engine import forecast_engine
from backend.database import async_session_factory
from backend.main import app


@pytest.mark.asyncio
async def test_forecast_engine_returns_zone_forecast():
    async with async_session_factory() as session:
        result = await forecast_engine.forecast_zone(session, "delhi", "south_delhi", horizon_hours=24)
    assert result["city"] == "delhi"
    assert result["zone"] == "south_delhi"
    assert 0 <= result["projected_risk"] <= 1
    assert isinstance(result["likely_triggers"], list)


@pytest.mark.asyncio
async def test_forecast_endpoint_requires_admin_and_returns_payload(client, admin_cookies):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as fresh_client:
        unauthorized = await fresh_client.get("/api/analytics/forecast", params={"city": "delhi"})
    assert unauthorized.status_code == 401

    response = await client.get(
        "/api/analytics/forecast",
        params={"city": "delhi", "horizon": 24},
        cookies=admin_cookies,
    )
    assert response.status_code == 200
    payload = response.json()["forecast"]
    assert payload["city"] == "delhi"
    assert isinstance(payload["zones"], list)

