"""Lightweight signed session tokens using only the standard library."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta
from typing import Any, Dict

from fastapi import Cookie, Header, HTTPException, status

from backend.config import settings
from backend.utils.time import utc_now_naive


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(payload: str) -> str:
    return hmac.new(
        settings.SESSION_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def create_session_token(subject: Dict[str, Any], hours: int | None = None) -> str:
    expires_at = utc_now_naive() + timedelta(hours=hours or settings.SESSION_DURATION_HOURS)
    payload = {
        **subject,
        "exp": expires_at.isoformat(),
    }
    payload_json = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    encoded_payload = _b64url_encode(payload_json.encode("utf-8"))
    signature = _sign(encoded_payload)
    return f"{encoded_payload}.{signature}"


def verify_session_token(token: str) -> Dict[str, Any]:
    try:
        encoded_payload, signature = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token format.",
        ) from exc

    expected_signature = _sign(encoded_payload)
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token signature.",
        )

    try:
        payload = json.loads(_b64url_decode(encoded_payload).decode("utf-8"))
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unreadable session token payload.",
        ) from exc

    exp = payload.get("exp")
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token expiry missing.",
        )

    expires_at = datetime.fromisoformat(exp)
    if expires_at < utc_now_naive():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )

    return payload


def parse_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required.",
        )
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be a Bearer token.",
        )
    return parts[1]


def parse_cookie_or_bearer(cookie_token: str | None, authorization: str | None) -> str:
    if cookie_token:
        return cookie_token
    if authorization:
        return parse_bearer_token(authorization)
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required.",
    )


async def get_current_session(
    rideshield_session: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
) -> Dict[str, Any]:
    token = parse_cookie_or_bearer(cookie_token=rideshield_session, authorization=authorization)
    return verify_session_token(token)


# Auth validation already happens inside verify_session_token, so keep a single implementation.
require_authenticated_session = get_current_session


async def get_admin_session(session: Dict[str, Any] = Header(default=None)):  # type: ignore[assignment]
    raise RuntimeError("Use require_admin_session dependency wrapper instead.")


async def require_admin_session(
    rideshield_session: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
) -> Dict[str, Any]:
    session = verify_session_token(parse_cookie_or_bearer(cookie_token=rideshield_session, authorization=authorization))
    if session.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin session required.",
        )
    return session


def ensure_worker_access(session: Dict[str, Any], worker_id: Any) -> None:
    if session.get("role") == "admin":
        return
    if session.get("role") == "worker" and session.get("worker_id") == str(worker_id):
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this worker resource.",
    )
