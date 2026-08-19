from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.activity import ActivityEvent
from app.schemas.overview import ActivityItem
from app.services.runtime_store import runtime_store
from app.services.seed_data import ADMIN_USER_ID


class ActivityService:
    def record(
        self,
        label: str,
        detail: str,
        *,
        route: str | None = None,
        related_goal_id: str | None = None,
        related_run_id: str | None = None,
        user_id: str | None = None,
        db: Session | None = None,
    ) -> ActivityItem:
        item = ActivityItem(
            id=f"act-{uuid4().hex[:10]}",
            label=label,
            detail=detail,
            route=route,
            timestamp="Now",
        )
        if db is not None:
            db.add(
                ActivityEvent(
                    id=item.id,
                    label=item.label,
                    detail=item.detail,
                    route=item.route,
                    timestamp=item.timestamp,
                    user_id=user_id or ADMIN_USER_ID,
                    related_goal_id=related_goal_id,
                    related_run_id=related_run_id,
                )
            )
        else:
            runtime_store.prepend_activity(item)
        return item

    def list_recent(self, db: Session | None = None, limit: int = 20) -> list[ActivityItem]:
        if db is not None:
            rows = (
                db.query(ActivityEvent)
                .order_by(ActivityEvent.created_at.desc(), ActivityEvent.id)
                .limit(limit)
                .all()
            )
            return [
                ActivityItem(
                    id=row.id,
                    label=row.label,
                    detail=row.detail,
                    route=row.route,
                    timestamp=row.timestamp,
                )
                for row in rows
            ]
        return runtime_store.activity[:limit]


activity_service = ActivityService()
