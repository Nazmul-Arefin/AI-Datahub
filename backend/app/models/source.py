from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UtcDateTime, utcnow


class IntegrationCatalog(TimestampMixin, Base):
    __tablename__ = "integrations_catalog"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    category: Mapped[str] = mapped_column(String(64), index=True)
    method: Mapped[str] = mapped_column(String(128), default="Official API")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    auth_type: Mapped[str] = mapped_column(String(32), default="nango")
    nango_provider_key: Mapped[str | None] = mapped_column(String(128), nullable=True)
    scopes: Mapped[list] = mapped_column(JSON, default=list)
    logo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)


class IntegrationConnection(TimestampMixin, Base):
    __tablename__ = "integration_connections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), index=True)
    catalog_key: Mapped[str] = mapped_column(String(64), ForeignKey("integrations_catalog.key"), index=True)
    auth_provider: Mapped[str] = mapped_column(String(32), default="nango")
    external_connection_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    connected_at: Mapped[datetime | None] = mapped_column(UtcDateTime, nullable=True)


class OAuthState(Base):
    __tablename__ = "oauth_states"

    state: Mapped[str] = mapped_column(String(128), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36))
    catalog_key: Mapped[str] = mapped_column(String(64))
    redirect_uri: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(UtcDateTime, default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(UtcDateTime)


class DataSource(TimestampMixin, Base):
    __tablename__ = "data_sources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    connection_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("integration_connections.id"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(128))
    category: Mapped[str] = mapped_column(String(64), index=True)
    type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    method: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(64), default="Connected")
    status_type: Mapped[str] = mapped_column(String(32), default="connected")
    last_sync: Mapped[str] = mapped_column(String(64), default="Unknown")
    assets: Mapped[str] = mapped_column(String(128), default="0 signals")
    scopes: Mapped[list] = mapped_column(JSON, default=list)
    purposes: Mapped[list] = mapped_column(JSON, default=list)
    used_by: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ai_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # viewonly so connection_id stays the single writable source of truth. A
    # writable relationship would sync its unset None over the column on flush
    # and silently null the foreign key.
    connection: Mapped["IntegrationConnection | None"] = relationship(viewonly=True)
