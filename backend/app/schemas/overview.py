from pydantic import BaseModel, Field


class OverviewCluster(BaseModel):
    key: str
    title: str
    count: int


class CalendarTask(BaseModel):
    id: str
    title: str
    time: str | None = None
    day_offset: int = Field(default=0, alias="dayOffset")

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
