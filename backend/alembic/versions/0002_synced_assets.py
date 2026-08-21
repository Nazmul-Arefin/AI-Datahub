"""Add synced_assets for Notion (and other) local copies

Revision ID: 0002_synced_assets
Revises: 0001_initial_dev1
Create Date: 2026-08-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_synced_assets"
down_revision: Union[str, None] = "0001_initial_dev1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "synced_assets",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("source_id", sa.String(length=64), sa.ForeignKey("data_sources.id"), nullable=False),
        sa.Column(
            "connection_id",
            sa.String(length=36),
            sa.ForeignKey("integration_connections.id"),
            nullable=True,
        ),
        sa.Column("provider", sa.String(length=64), nullable=False, server_default="notion"),
        sa.Column("external_id", sa.String(length=128), nullable=False),
        sa.Column("object_type", sa.String(length=64), nullable=False, server_default="page"),
        sa.Column("title", sa.String(length=512), nullable=False, server_default="Untitled"),
        sa.Column("url", sa.String(length=1024), nullable=True),
        sa.Column("parent_type", sa.String(length=64), nullable=True),
        sa.Column("parent_id", sa.String(length=128), nullable=True),
        sa.Column("last_edited_at", sa.String(length=64), nullable=True),
        sa.Column("content_text", sa.Text(), nullable=True),
        sa.Column("raw_json", sa.JSON(), nullable=True),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("source_id", "external_id", name="uq_synced_assets_source_external"),
    )
    op.create_index("ix_synced_assets_source_id", "synced_assets", ["source_id"])
    op.create_index("ix_synced_assets_connection_id", "synced_assets", ["connection_id"])
    op.create_index("ix_synced_assets_provider", "synced_assets", ["provider"])
    op.create_index("ix_synced_assets_external_id", "synced_assets", ["external_id"])


def downgrade() -> None:
    op.drop_index("ix_synced_assets_external_id", table_name="synced_assets")
    op.drop_index("ix_synced_assets_provider", table_name="synced_assets")
    op.drop_index("ix_synced_assets_connection_id", table_name="synced_assets")
    op.drop_index("ix_synced_assets_source_id", table_name="synced_assets")
    op.drop_table("synced_assets")
