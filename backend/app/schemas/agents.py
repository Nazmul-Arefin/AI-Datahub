from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    mission: str
    goal_id: str | None = Field(default=None, alias="goalId")

    model_config = {"populate_by_name": True}


class AgentRunResponse(BaseModel):
    run_id: str = Field(alias="runId")
    status: str = "queued"
    session_id: str | None = Field(default=None, alias="sessionId")
    events: list[dict] = Field(default_factory=list)
    summary: str | None = None
    mode: str | None = None

    model_config = {"populate_by_name": True}


class AgentRunStatus(BaseModel):
    run_id: str = Field(alias="runId")
    status: str
    session_id: str | None = Field(default=None, alias="sessionId")
    phase: int = 0
    progress: float = 0.0
    events: list[dict] = Field(default_factory=list)
    summary: str | None = None
    mode: str | None = None

    model_config = {"populate_by_name": True}


class AllowedTool(BaseModel):
    name: str
    description: str | None = None
    server_id: str | None = Field(default=None, alias="serverId")
    server_name: str | None = Field(default=None, alias="serverName")

    model_config = {"populate_by_name": True}


class AllowedToolsResponse(BaseModel):
    tools: list[AllowedTool]
    mode: str | None = None
