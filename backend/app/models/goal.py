from sqlalchemy import Boolean, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Goal(TimestampMixin, Base):
    __tablename__ = "goals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    short: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(64), default="On track")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    schedule_offset: Mapped[int | None] = mapped_column(Integer, nullable=True)
    scheduled_time: Mapped[str | None] = mapped_column(String(16), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sources: Mapped[int] = mapped_column(Integer, default=0)
    memories: Mapped[int] = mapped_column(Integer, default=0)
    outputs: Mapped[int] = mapped_column(Integer, default=0)
    tasks: Mapped[int] = mapped_column(Integer, default=0)
    completed: Mapped[int] = mapped_column(Integer, default=0)
    accent: Mapped[str | None] = mapped_column(String(32), nullable=True)
    category: Mapped[str | None] = mapped_column(String(64), nullable=True)
    updated: Mapped[str | None] = mapped_column(String(64), nullable=True)
    subgoals: Mapped[list] = mapped_column(JSON, default=list)
    task_labels: Mapped[list] = mapped_column(JSON, default=list)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    basis: Mapped[list] = mapped_column(JSON, default=list)
    observations: Mapped[list] = mapped_column(JSON, default=list)
    prediction: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    suggestions: Mapped[list] = mapped_column(JSON, default=list)
    monitoring_paused: Mapped[bool] = mapped_column(Boolean, default=False)
    custom: Mapped[bool] = mapped_column(Boolean, default=False)


class ExecutionTask(TimestampMixin, Base):
    __tablename__ = "execution_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    goal_id: Mapped[str | None] = mapped_column(String(64), ForeignKey("goals.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    state: Mapped[str] = mapped_column(String(64), default="Pending")
    due_at: Mapped[str | None] = mapped_column(String(64), nullable=True)
    subgoal_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
