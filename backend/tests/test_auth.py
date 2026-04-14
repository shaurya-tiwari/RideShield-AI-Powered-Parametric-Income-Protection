"""Tests for auth and session endpoints."""

import pytest


@pytest.mark.asyncio
async def test_worker_login_and_me(client, valid_worker_data):
    register_response = await client.post("/api/workers/register", json=valid_worker_data)
    assert register_response.status_code == 201

    device_fingerprint = "worker-device-auth-01"
    login_response = await client.post(
        "/api/auth/worker/login",
        json={
            "phone": valid_worker_data["phone"],
            "password": valid_worker_data["password"],
            "device_fingerprint": device_fingerprint,
        },
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["session"]["role"] == "worker"
    assert "token" in login_data

    me_response = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_data['token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["session"]["phone"] == valid_worker_data["phone"]


@pytest.mark.asyncio
async def test_worker_login_sets_root_scoped_cookie_for_protected_routes(client, valid_worker_data):
    register_response = await client.post("/api/workers/register", json=valid_worker_data)
    assert register_response.status_code == 201
    worker_id = register_response.json()["worker_id"]

    device_fingerprint = "worker-device-auth-02"
    login_response = await client.post(
        "/api/auth/worker/login",
        json={
            "phone": valid_worker_data["phone"],
            "password": valid_worker_data["password"],
            "device_fingerprint": device_fingerprint,
        },
    )
    assert login_response.status_code == 200
    assert "Path=/" in login_response.headers.get("set-cookie", "")

    me_response = await client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["session"]["worker_id"] == worker_id

    profile_response = await client.get(f"/api/workers/me/{worker_id}")
    assert profile_response.status_code == 200


@pytest.mark.asyncio
async def test_worker_login_rejects_wrong_password(client, valid_worker_data):
    register_response = await client.post("/api/workers/register", json=valid_worker_data)
    assert register_response.status_code == 201

    login_response = await client.post(
        "/api/auth/worker/login",
        json={
            "phone": valid_worker_data["phone"],
            "password": "wrongpass123",
            "device_fingerprint": "worker-device-auth-03",
        },
    )
    assert login_response.status_code == 401


@pytest.mark.asyncio
async def test_worker_login_requires_device_fingerprint(client, valid_worker_data):
    register_response = await client.post("/api/workers/register", json=valid_worker_data)
    assert register_response.status_code == 201

    login_response = await client.post(
        "/api/auth/worker/login",
        json={"phone": valid_worker_data["phone"], "password": valid_worker_data["password"]},
    )
    assert login_response.status_code == 422


@pytest.mark.asyncio
async def test_admin_login_and_protected_queue(client):
    login_response = await client.post(
        "/api/auth/admin/login",
        json={"username": "admin", "password": "rideshield-test-admin-password"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["token"]

    queue_response = await client.get(
        "/api/claims/review-queue",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert queue_response.status_code == 200


@pytest.mark.asyncio
async def test_admin_login_sets_root_scoped_cookie_for_protected_routes(client):
    login_response = await client.post(
        "/api/auth/admin/login",
        json={"username": "admin", "password": "rideshield-test-admin-password"},
    )
    assert login_response.status_code == 200
    assert "Path=/" in login_response.headers.get("set-cookie", "")

    me_response = await client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["session"]["role"] == "admin"

    queue_response = await client.get("/api/claims/review-queue")
    assert queue_response.status_code == 200


@pytest.mark.asyncio
async def test_protected_admin_endpoint_rejects_without_token(client):
    response = await client.get("/api/claims/review-queue")
    assert response.status_code == 401
