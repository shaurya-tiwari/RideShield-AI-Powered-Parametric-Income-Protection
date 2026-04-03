"""Time helpers shared across backend modules."""

from __future__ import annotations

from datetime import datetime, timezone


def utc_now_naive() -> datetime:
    """Return the current UTC timestamp without tzinfo for DB compatibility."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
