from pydantic import BaseModel, Field


class Subgoal(BaseModel):
    name: str
    done: int = 0
    total: int = 1
    state: str = "Active"


class GoalObservation(BaseModel):
    type: str
    title: str
    detail: str
    source: str | None = None
    time: str | None = None


class GoalPrediction(BaseModel):
    probability: int
    risk: str
    title: str
    impact: str | None = None
    window: str | None = None
    confidence: str | None = None


class GoalSuggestion(BaseModel):
    id: str
    label: str
    title: str
    action: str
    updates: int = 0
    options: list[str] = Field(default_factory=list)


class Goal(BaseModel):
    id: str | None = None
    title: str
    short: str | None = None
    status: str = "On track"
    progress: int = 0
    schedule_offset: int | None = Field(default=None, alias="scheduleOffset")
    scheduled_time: str | None = Field(default=None, alias="scheduledTime")
    description: str | None = None
    sources: int = 0
    memories: int = 0
    outputs: int = 0
    tasks: int = 0
    completed: int = 0
    accent: str | None = None
    subgoals: list[Subgoal] = Field(default_factory=list)
    task_labels: list[str] = Field(default_factory=list, alias="taskLabels")
    recommendation: str | None = None
    basis: list[str] = Field(default_factory=list)
    observations: list[GoalObservation] = Field(default_factory=list)
    prediction: GoalPrediction | None = None
    suggestions: list[GoalSuggestion] = Field(default_factory=list)
    monitoring_paused: bool = Field(default=False, alias="monitoringPaused")
    custom: bool = False
    category: str | None = None
    updated: str | None = None

    model_config = {"populate_by_name": True}


class GoalListResponse(BaseModel):
    goals: list[Goal]
    total: int


class GoalCreateRequest(BaseModel):
    title: str
    short: str | None = None
    status: str = "On track"
    progress: int = 0
    schedule_offset: int | None = Field(default=None, alias="scheduleOffset")
    scheduled_time: str | None = Field(default=None, alias="scheduledTime")
    description: str | None = None
    accent: str | None = None
    category: str | None = None
    subgoals: list[Subgoal] = Field(default_factory=list)
    task_labels: list[str] = Field(default_factory=list, alias="taskLabels")
    custom: bool = True

    model_config = {"populate_by_name": True}


class GoalUpdateRequest(BaseModel):
    progress: int | None = None
    status: str | None = None
    monitoring_paused: bool | None = Field(default=None, alias="monitoringPaused")
    subgoals: list[Subgoal] | None = None

    model_config = {"populate_by_name": True}
