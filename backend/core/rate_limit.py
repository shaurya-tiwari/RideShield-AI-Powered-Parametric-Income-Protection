"""Simple in-memory rate limiting for sensitive endpoints."""

from __future__ import annotations

import asyncio
import time

from fastapi import HTTPException, status


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, list[float]] = {}
        self._lock = asyncio.Lock()

    async def hit(self, key: str, *, limit: int, window_seconds: int) -> None:
        now = time.monotonic()
        async with self._lock:
            recent = [
                timestamp
                for timestamp in self._events.get(key, [])
                if now - timestamp < window_seconds
            ]
            if len(recent) >= limit:
                retry_after = max(1, int(window_seconds - (now - recent[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many attempts. Retry in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )

            recent.append(now)
            self._events[key] = recent


auth_rate_limiter = InMemoryRateLimiter()
