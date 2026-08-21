"""Local copies of remote integration objects (e.g. Notion pages)."""

from datetime import datetime

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UtcDateTime, utcnow


class SyncedAsset(TimestampMixin, Base):
    """One synced remote object stored in our Postgres (local system of record)."""

    __tablename__ = "synced_assets"
    __table_args__ = (
        UniqueConstraint("source_id", "external_id", name="uq_synced_assets_source_external"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    source_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("data_sources.id"), index=True
    )
    connection_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("integration_connections.id"), nullable=True, index=True
    )
    provider: Mapped[str] = mapped_column(String(64), default="notion", index=True)
    external_id: Mapped[str] = mapped_column(String(128), index=True)
    object_type: Mapped[str] = mapped_column(String(64), default="page")
    title: Mapped[str] = mapped_column(String(512), default="Untitled")
    url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    parent_type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    parent_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    last_edited_at: Mapped[str | None] = mapped_column(String(64), nullable=True)
    content_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    synced_at: Mapped[datetime] = mapped_column(UtcDateTime, default=utcnow)
