"""End-to-end explainability checks for claim detail payloads."""

import pytest
from scripts.run_scenario import enrich_worker_for_demo


@pytest.mark.asyncio
async def test_claim_detail_includes_fraud_and_payout_breakdown(client, valid_worker_data, admin_cookies):
    worker_data = dict(valid_worker_data)
    worker_data["phone"] = "+919999999997"
    worker_data["zone"] = "east_delhi"
    worker_data["self_reported_income"] = 950

    register_response = await client.post("/api/workers/register", json=worker_data)
    assert register_response.status_code == 201
    worker_id = register_response.json()["worker_id"]

    create_policy_response = await client.post(
        "/api/policies/create",
        json={"worker_id": worker_id, "plan_name": "assured_plan"},
    )
    assert create_policy_response.status_code == 201

    await enrich_worker_for_demo(worker_id, "east_delhi", "edge")

    force_activate = await client.post(
        f"/api/policies/admin/force-activate?worker_id={worker_id}",
        cookies=admin_cookies,
    )
    assert force_activate.status_code == 200

    trigger_response = await client.post(
        "/api/triggers/check",
        json={"city": "delhi", "zones": ["east_delhi"], "scenario": "platform_outage"},
    )
    assert trigger_response.status_code == 200

    login_response = await client.post(
        "/api/auth/worker/login",
        json={"phone": worker_data["phone"], "password": worker_data["password"]},
    )
    assert login_response.status_code == 200
    worker_cookies = dict(client.cookies)

    claims_response = await client.get(f"/api/claims/worker/{worker_id}", cookies=worker_cookies)
    assert claims_response.status_code == 200
    claim_id = claims_response.json()["claims"][0]["id"]

    detail_response = await client.get(f"/api/claims/detail/{claim_id}", cookies=worker_cookies)
    assert detail_response.status_code == 200
    payload = detail_response.json()

    assert "fraud_model" in payload
    assert "payout_breakdown" in payload
    assert payload["payout_breakdown"]["operating_cost_factor"] == pytest.approx(0.85, rel=1e-4)
    assert payload["payout_breakdown"]["net_income_per_hour"] <= payload["payout_breakdown"]["income_per_hour"]
    assert "model_version" in payload["fraud_model"]

