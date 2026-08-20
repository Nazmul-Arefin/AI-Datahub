from pydantic import BaseModel, Field


class OverviewCluster(BaseModel):
    key: str
    title: str
    count: int


class CalendarTask(BaseModel):
    """One Overview calendar agenda row (YOU or AI)."""

    id: str
    title: str
    time: str | None = None
    day_offset: int = Field(default=0, alias="dayOffset")
    owner: str = "human"  # human | ai
    label: str | None = None
    detail: str | None = None
    status: str | None = None
    type: str | None = None  # goal | action | complete | planning
    goal_id: str | None = Field(default=None, alias="goalId")
    icon: str | None = None

    model_config = {"populate_by_name": True}


class ActivityItem(BaseModel):
    id: str
    label: str
    detail: str
    route: str | None = None
    timestamp: str | None = None


class OverviewResponse(BaseModel):
    clusters: list[OverviewCluster]
    calendar_tasks: list[CalendarTask] = Field(default_factory=list, alias="calendarTasks")
    activity: list[ActivityItem] = Field(default_factory=list)

    model_config = {"populate_by_name": True}
