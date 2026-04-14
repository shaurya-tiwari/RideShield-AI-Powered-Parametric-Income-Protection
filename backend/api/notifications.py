"""
Notification API — in-app notifications for workers.
"""

from datetime import timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, desc, select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.core.session_auth import require_authenticated_session, ensure_worker_access
from backend.db.models import Notification
from backend.utils.time import utc_now_naive

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/worker/{worker_id}")
async def get_worker_notifications(
    worker_id: UUID,
    unread_only: bool = False,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    session: dict = Depends(require_authenticated_session),
):
    """Get notifications for a worker, newest first."""
    ensure_worker_access(session, worker_id)

    query = select(Notification).where(Notification.worker_id == worker_id)
    if unread_only:
        query = query.where(Notification.is_read.is_(False))
    query = query.order_by(desc(Notification.created_at)).limit(limit)

    notifications = (await db.execute(query)).scalars().all()

    # Count unread
    unread_count = (
        await db.execute(
            select(func.count(Notification.id)).where(
                and_(
                    Notification.worker_id == worker_id,
                    Notification.is_read.is_(False),
                )
            )
        )
    ).scalar() or 0

    return {
        "worker_id": str(worker_id),
        "unread_count": unread_count,
        "notifications": [
            {
                "id": str(n.id),
                "category": n.category,
                "title": n.title,
                "body": n.body,
                "metadata": n.metadata_json,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifications
        ],
    }


@router.post("/worker/{worker_id}/mark-read")
async def mark_notifications_read(
    worker_id: UUID,
    notification_ids: Optional[list[str]] = None,
    db: AsyncSession = Depends(get_db),
    session: dict = Depends(require_authenticated_session),
):
    """Mark notifications as read. If no IDs given, marks all unread as read."""
    ensure_worker_access(session, worker_id)

    if notification_ids:
        uuids = [UUID(nid) for nid in notification_ids]
        await db.execute(
            update(Notification)
            .where(
                and_(
                    Notification.worker_id == worker_id,
                    Notification.id.in_(uuids),
                )
            )
            .values(is_read=True)
        )
    else:
        await db.execute(
            update(Notification)
            .where(
                and_(
                    Notification.worker_id == worker_id,
                    Notification.is_read.is_(False),
                )
            )
            .values(is_read=True)
        )
    await db.commit()
    return {"status": "ok", "worker_id": str(worker_id)}


async def create_notification(
    db: AsyncSession,
    worker_id: UUID,
    category: str,
    title: str,
    body: str = "",
    metadata: dict = None,
):
    """Helper to create a notification from anywhere in the backend."""
    notification = Notification(
        worker_id=worker_id,
        category=category,
        title=title,
        body=body,
        metadata_json=metadata or {},
    )
    db.add(notification)
    return notification
