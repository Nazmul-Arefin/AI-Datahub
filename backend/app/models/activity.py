from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class ActivityEvent(TimestampMixin, Base):
    __tablename__ = "activity_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    label: Mapped[str] = mapped_column(String(255))
    detail: Mapped[str] = mapped_column(Text, default="")
    route: Mapped[str | None] = mapped_column(String(64), nullable=True)
    timestamp: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    related_goal_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    related_run_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
