from pydantic import BaseModel, Field


class ExecutionTask(BaseModel):
    id: str
    goal_id: str | None = Field(default=None, alias="goalId")
    name: str
    state: str = "Pending"
    due_at: str | None = Field(default=None, alias="dueAt")
    subgoal_name: str | None = Field(default=None, alias="subgoalName")

    model_config = {"populate_by_name": True}


class TaskListResponse(BaseModel):
    tasks: list[ExecutionTask]
    total: int
