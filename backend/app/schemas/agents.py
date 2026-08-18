from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    mission: str
    goal_id: str | None = Field(default=None, alias="goalId")

    model_config = {"populate_by_name": True}


class AgentRunResponse(BaseModel):
    run_id: str = Field(alias="runId")
    status: str = "queued"

    model_config = {"populate_by_name": True}


class AgentRunStatus(BaseModel):
    run_id: str = Field(alias="runId")
    status: str
    phase: int = 0
    progress: float = 0.0

    model_config = {"populate_by_name": True}
