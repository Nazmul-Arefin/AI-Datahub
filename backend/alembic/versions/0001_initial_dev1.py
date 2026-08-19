"""initial Dev1 schema

Revision ID: 0001_initial_dev1
Revises:
Create Date: 2026-08-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_dev1"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("username", sa.String(length=128), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False, server_default=""),
        sa.Column("display_name", sa.String(length=255), nullable=False, server_default="Dev User"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "goals",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("short", sa.String(length=128), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False, server_default="On track"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("schedule_offset", sa.Integer(), nullable=True),
        sa.Column("scheduled_time", sa.String(length=16), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sources", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("memories", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("outputs", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("tasks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("accent", sa.String(length=32), nullable=True),
        sa.Column("category", sa.String(length=64), nullable=True),
        sa.Column("updated", sa.String(length=64), nullable=True),
        sa.Column("subgoals", sa.JSON(), nullable=True),
        sa.Column("task_labels", sa.JSON(), nullable=True),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.Column("basis", sa.JSON(), nullable=True),
        sa.Column("observations", sa.JSON(), nullable=True),
        sa.Column("prediction", sa.JSON(), nullable=True),
        sa.Column("suggestions", sa.JSON(), nullable=True),
        sa.Column("monitoring_paused", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("custom", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "execution_tasks",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("goal_id", sa.String(length=64), sa.ForeignKey("goals.id"), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("state", sa.String(length=64), nullable=False, server_default="Pending"),
        sa.Column("due_at", sa.String(length=64), nullable=True),
        sa.Column("subgoal_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_execution_tasks_goal_id", "execution_tasks", ["goal_id"])

    op.create_table(
        "integrations_catalog",
        sa.Column("key", sa.String(length=64), primary_key=True),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("method", sa.String(length=128), nullable=False, server_default="Official API"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("auth_type", sa.String(length=32), nullable=False, server_default="nango"),
        sa.Column("nango_provider_key", sa.String(length=128), nullable=True),
        sa.Column("scopes", sa.JSON(), nullable=True),
        sa.Column("logo_url", sa.String(length=512), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_integrations_catalog_category", "integrations_catalog", ["category"])

    op.create_table(
        "integration_connections",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("catalog_key", sa.String(length=64), sa.ForeignKey("integrations_catalog.key"), nullable=False),
        sa.Column("auth_provider", sa.String(length=32), nullable=False, server_default="nango"),
        sa.Column("external_connection_id", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("connected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_integration_connections_user_id", "integration_connections", ["user_id"])
    op.create_index("ix_integration_connections_catalog_key", "integration_connections", ["catalog_key"])
    op.create_index("ix_integration_connections_status", "integration_connections", ["status"])

    op.create_table(
        "oauth_states",
        sa.Column("state", sa.String(length=128), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("catalog_key", sa.String(length=64), nullable=False),
        sa.Column("redirect_uri", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "data_sources",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("connection_id", sa.String(length=36), sa.ForeignKey("integration_connections.id"), nullable=True),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("type", sa.String(length=128), nullable=True),
        sa.Column("method", sa.String(length=128), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False, server_default="Connected"),
        sa.Column("status_type", sa.String(length=32), nullable=False, server_default="connected"),
        sa.Column("last_sync", sa.String(length=64), nullable=False, server_default="Unknown"),
        sa.Column("assets", sa.String(length=128), nullable=False, server_default="0 signals"),
        sa.Column("scopes", sa.JSON(), nullable=True),
        sa.Column("purposes", sa.JSON(), nullable=True),
        sa.Column("used_by", sa.String(length=255), nullable=True),
        sa.Column("ai_enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_data_sources_connection_id", "data_sources", ["connection_id"])
    op.create_index("ix_data_sources_category", "data_sources", ["category"])

    op.create_table(
        "activity_events",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("detail", sa.Text(), nullable=False, server_default=""),
        sa.Column("route", sa.String(length=64), nullable=True),
        sa.Column("timestamp", sa.String(length=64), nullable=True),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("related_goal_id", sa.String(length=64), nullable=True),
        sa.Column("related_run_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_activity_events_user_id", "activity_events", ["user_id"])


def downgrade() -> None:
    op.drop_table("activity_events")
    op.drop_table("data_sources")
    op.drop_table("oauth_states")
    op.drop_table("integration_connections")
    op.drop_table("integrations_catalog")
    op.drop_table("execution_tasks")
    op.drop_table("goals")
    op.drop_table("users")
