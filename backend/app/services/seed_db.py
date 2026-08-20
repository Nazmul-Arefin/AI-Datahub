"""Idempotent database seed for Dev1 tables (Postgres or SQLite)."""

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.activity import ActivityEvent
from app.models.base import utcnow
from app.models.goal import ExecutionTask, Goal
from app.models.source import DataSource, IntegrationCatalog, IntegrationConnection
from app.models.user import User
from app.services.seed_data import (
    ADMIN_USER_ID,
    INTEGRATION_CATALOG,
    SEED_ACTIVITY,
    SEED_GOALS,
    SEED_SOURCES,
    SEED_TASKS,
    SOURCE_CATALOG_KEYS,
)


def seed_database(db: Session) -> None:
    if db.get(User, ADMIN_USER_ID) is None:
        db.add(
            User(
                id=ADMIN_USER_ID,
                username=settings.admin_username,
                password_hash=settings.admin_password,
                display_name="Dev User",
            )
        )

    for item in INTEGRATION_CATALOG:
        row = db.get(IntegrationCatalog, item.id)
        if row is None:
            row = IntegrationCatalog(key=item.id)
            db.add(row)
        row.name = item.name
        row.category = item.category
        row.method = item.method
        row.description = item.description
        row.auth_type = item.auth_type
        row.nango_provider_key = item.nango_provider_key
        row.scopes = list(item.scopes)
        row.logo_url = item.logo_url
        row.enabled = True

    # Flush at each foreign key boundary. Referenced rows must already exist
    # because nothing here uses writable relationships to imply insert order.
    db.flush()

    if settings.use_mock_data and db.query(Goal).count() == 0:
        for goal in SEED_GOALS:
            if not goal.id:
                continue
            db.add(
                Goal(
                    id=goal.id,
                    title=goal.title,
                    short=goal.short,
                    status=goal.status,
                    progress=goal.progress,
                    schedule_offset=goal.schedule_offset,
                    scheduled_time=goal.scheduled_time,
                    description=goal.description,
                    sources=goal.sources,
                    memories=goal.memories,
                    outputs=goal.outputs,
                    tasks=goal.tasks,
                    completed=goal.completed,
                    accent=goal.accent,
                    category=goal.category,
                    updated=goal.updated,
                    subgoals=[item.model_dump() for item in goal.subgoals],
                    task_labels=list(goal.task_labels),
                    recommendation=goal.recommendation,
                    basis=list(goal.basis),
                    observations=[item.model_dump() for item in goal.observations],
                    prediction=goal.prediction.model_dump() if goal.prediction else None,
                    suggestions=[item.model_dump() for item in goal.suggestions],
                    monitoring_paused=goal.monitoring_paused,
                    custom=goal.custom,
                )
            )

    db.flush()

    if settings.use_mock_data:
        existing_tasks = {row.id: row for row in db.query(ExecutionTask).all()}
        for task in SEED_TASKS:
            row = existing_tasks.get(task.id)
            if row is None:
                db.add(
                    ExecutionTask(
                        id=task.id,
                        goal_id=task.goal_id,
                        name=task.name,
                        state=task.state,
                        due_at=task.due_at,
                        subgoal_name=task.subgoal_name,
                    )
                )
            else:
                # Keep seed calendar day offsets current across restarts.
                row.due_at = task.due_at
                row.name = task.name
                row.state = task.state
                row.subgoal_name = task.subgoal_name
                row.goal_id = task.goal_id

    if db.query(DataSource).count() == 0:
        for source in SEED_SOURCES:
            connection_id = source.connection_id
            catalog_key = SOURCE_CATALOG_KEYS.get(source.id)
            if catalog_key is not None and db.get(IntegrationCatalog, catalog_key) is None:
                catalog_key = None
            if connection_id and catalog_key is None:
                # Without a catalog row the foreign key would fail; keep the
                # source unlinked rather than attaching it to the wrong entry.
                connection_id = None
            if connection_id and db.get(IntegrationConnection, connection_id) is None:
                db.add(
                    IntegrationConnection(
                        id=connection_id,
                        user_id=ADMIN_USER_ID,
                        catalog_key=catalog_key,
                        auth_provider="nango",
                        status="connected",
                        connected_at=utcnow(),
                    )
                )
                db.flush()
            db.add(
                DataSource(
                    id=source.id,
                    connection_id=connection_id,
                    name=source.name,
                    category=source.category,
                    type=source.type,
                    method=source.method,
                    status=source.status,
                    status_type=source.status_type,
                    last_sync=source.last_sync,
                    assets=source.assets,
                    scopes=list(source.scopes),
                    purposes=list(source.purposes),
                    used_by=source.used_by,
                    ai_enabled=source.ai_enabled,
                )
            )

    if settings.use_mock_data and db.query(ActivityEvent).count() == 0:
        for item in SEED_ACTIVITY:
            db.add(
                ActivityEvent(
                    id=item.id,
                    label=item.label,
                    detail=item.detail,
                    route=item.route,
                    timestamp=item.timestamp,
                    user_id=ADMIN_USER_ID,
                )
            )

    db.flush()
