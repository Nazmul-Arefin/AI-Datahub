"""Add goal image_url and image_status for Coze artwork.

Revision ID: 0002_goal_image
Revises: 0001_initial_dev1
Create Date: 2026-08-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_goal_image"
down_revision: Union[str, None] = "0001_initial_dev1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("goals", sa.Column("image_url", sa.String(length=1024), nullable=True))
    op.add_column(
        "goals",
        sa.Column("image_status", sa.String(length=32), nullable=False, server_default="idle"),
    )


def downgrade() -> None:
    op.drop_column("goals", "image_status")
    op.drop_column("goals", "image_url")
