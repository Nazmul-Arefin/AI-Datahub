from typing import Literal

from pydantic import BaseModel, Field


AutonomyLevel = Literal["monitor", "prepare", "assist"]


class SystemSettings(BaseModel):
    autonomy: AutonomyLevel = "prepare"
    confirm_memory: bool = Field(default=True, alias="confirmMemory")
    goal_scoped_context: bool = Field(default=True, alias="goalScopedContext")
    pause_monitoring: bool = Field(default=False, alias="pauseMonitoring")
    notify_decisions: bool = Field(default=True, alias="notifyDecisions")
    show_activity_dock: bool = Field(default=True, alias="showActivityDock")
    calendar_reminders: bool = Field(default=True, alias="calendarReminders")
    reduce_motion: bool = Field(default=False, alias="reduceMotion")
    compact_activity: bool = Field(default=False, alias="compactActivity")

    model_config = {"populate_by_name": True, "ser_json_by_alias": True}


class SystemSettingsPatchRequest(BaseModel):
    autonomy: AutonomyLevel | None = None
    confirm_memory: bool | None = Field(default=None, alias="confirmMemory")
    goal_scoped_context: bool | None = Field(default=None, alias="goalScopedContext")
    pause_monitoring: bool | None = Field(default=None, alias="pauseMonitoring")
    notify_decisions: bool | None = Field(default=None, alias="notifyDecisions")
    show_activity_dock: bool | None = Field(default=None, alias="showActivityDock")
    calendar_reminders: bool | None = Field(default=None, alias="calendarReminders")
    reduce_motion: bool | None = Field(default=None, alias="reduceMotion")
    compact_activity: bool | None = Field(default=None, alias="compactActivity")

    model_config = {"populate_by_name": True, "ser_json_by_alias": True}
