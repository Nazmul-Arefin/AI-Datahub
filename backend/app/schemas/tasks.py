from pydantic import BaseModel, Field


class ExecutionTask(BaseModel):
    id: str
    goal_id: str | None = Field(default=None, alias="goalId")
    name: str
    state: str = "Pending"
    due_at: str | None = Field(default=None, alias="dueAt")
    subgoal_name: str | None = Field(default=None, alias="subgoalName")
    owner: str = "human"  # human | ai

    model_config = {"populate_by_name": True}


class TaskListResponse(BaseModel):
    tasks: list[ExecutionTask]
    total: int


class TaskCreateRequest(BaseModel):
    name: str
    goal_id: str | None = Field(default=None, alias="goalId")
    due_at: str | None = Field(default=None, alias="dueAt")
    owner: str = "human"
    subgoal_name: str | None = Field(default=None, alias="subgoalName")
    state: str = "Pending"

    model_config = {"populate_by_name": True}


class TaskUpdateRequest(BaseModel):
    name: str | None = None
    state: str | None = None
    due_at: str | None = Field(default=None, alias="dueAt")
    subgoal_name: str | None = Field(default=None, alias="subgoalName")
    owner: str | None = None

    model_config = {"populate_by_name": True}
