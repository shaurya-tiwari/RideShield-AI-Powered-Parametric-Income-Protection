"""Simple in-memory rate limiting for sensitive endpoints."""

from __future__ import annotations

import asyncio
import time

from fastapi import HTTPException, status

from backend.config import settings


class InMemoryRateLimiter:
    def __init__(self, cleanup_interval: int = 100) -> None:
        self._events: dict[str, list[float]] = {}
        self._windows: dict[str, int] = {}
        self._lock = asyncio.Lock()
        self._hits_since_cleanup = 0
        self._cleanup_interval = max(1, cleanup_interval)

    def _prune_key_locked(self, key: str, now: float, window_seconds: int) -> list[float]:
        recent = [
            timestamp
            for timestamp in self._events.get(key, [])
            if now - timestamp < window_seconds
        ]
        if recent:
            self._events[key] = recent
            self._windows[key] = window_seconds
        else:
            self._events.pop(key, None)
            self._windows.pop(key, None)
        return recent

    def _cleanup_locked(self, now: float) -> None:
        stale_keys = []
        for key, timestamps in list(self._events.items()):
            window_seconds = self._windows.get(key)
            if not window_seconds:
                stale_keys.append(key)
                continue

            recent = [timestamp for timestamp in timestamps if now - timestamp < window_seconds]
            if recent:
                self._events[key] = recent
            else:
                stale_keys.append(key)

        for key in stale_keys:
            self._events.pop(key, None)
            self._windows.pop(key, None)

        self._hits_since_cleanup = 0

    async def hit(self, key: str, *, limit: int, window_seconds: int) -> None:
        if settings.ENV == "test":
            return
        now = time.monotonic()
        async with self._lock:
            self._hits_since_cleanup += 1
            recent = self._prune_key_locked(key, now, window_seconds)
            if len(recent) >= limit:
                retry_after = max(1, int(window_seconds - (now - recent[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many attempts. Retry in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )

            recent.append(now)
            self._events[key] = recent
            self._windows[key] = window_seconds
            if self._hits_since_cleanup >= self._cleanup_interval:
                self._cleanup_locked(now)

    async def reset(self) -> None:
        async with self._lock:
            self._events.clear()
            self._windows.clear()
            self._hits_since_cleanup = 0


auth_rate_limiter = InMemoryRateLimiter()
