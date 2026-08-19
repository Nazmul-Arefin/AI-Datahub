"""Idempotent Postgres seed for Dev1 tables."""

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.activity import ActivityEvent
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

    if db.query(Goal).count() == 0:
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

    if db.query(ExecutionTask).count() == 0:
        for task in SEED_TASKS:
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

    if db.query(DataSource).count() == 0:
        for source in SEED_SOURCES:
            connection_id = source.connection_id
            if connection_id and db.get(IntegrationConnection, connection_id) is None:
                catalog_key = "google-calendar" if source.id == "calendar" else source.id
                if catalog_key == "notion":
                    catalog_key = "notion"
                db.add(
                    IntegrationConnection(
                        id=connection_id,
                        user_id=ADMIN_USER_ID,
                        catalog_key=catalog_key if db.get(IntegrationCatalog, catalog_key) else INTEGRATION_CATALOG[0].id,
                        auth_provider="nango",
                        status="connected",
                    )
                )
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

    if db.query(ActivityEvent).count() == 0:
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
