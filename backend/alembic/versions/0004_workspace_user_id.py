"""Scope goals, tasks, and connected sources by user_id.

Revision ID: 0004_workspace_user_id
Revises: 0003_goal_image
Create Date: 2026-08-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_workspace_user_id"
down_revision: Union[str, None] = "0003_goal_image"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("goals", sa.Column("user_id", sa.String(length=36), nullable=False, server_default="dev-user"))
    op.create_index("ix_goals_user_id", "goals", ["user_id"])
    op.add_column(
        "execution_tasks",
        sa.Column("user_id", sa.String(length=36), nullable=False, server_default="dev-user"),
    )
    op.create_index("ix_execution_tasks_user_id", "execution_tasks", ["user_id"])
    op.add_column(
        "data_sources",
        sa.Column("user_id", sa.String(length=36), nullable=False, server_default="dev-user"),
    )
    op.create_index("ix_data_sources_user_id", "data_sources", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_data_sources_user_id", table_name="data_sources")
    op.drop_column("data_sources", "user_id")
    op.drop_index("ix_execution_tasks_user_id", table_name="execution_tasks")
    op.drop_column("execution_tasks", "user_id")
    op.drop_index("ix_goals_user_id", table_name="goals")
    op.drop_column("goals", "user_id")
