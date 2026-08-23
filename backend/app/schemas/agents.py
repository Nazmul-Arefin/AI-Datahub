from typing import Any

from pydantic import BaseModel, Field


class AgentRunRequest(BaseModel):
    mission: str
    goal_id: str | None = Field(default=None, alias="goalId")

    model_config = {"populate_by_name": True}


class AgentRunResponse(BaseModel):
    run_id: str = Field(alias="runId")
    status: str = "queued"
    session_id: str | None = Field(default=None, alias="sessionId")
    phase: int = 0
    progress: float = 0.0
    events: list[dict] = Field(default_factory=list)
    summary: str | None = None
    mode: str | None = None
    work_plan: list[Any] = Field(default_factory=list, alias="workPlan")
    guideline_plan: list[Any] = Field(default_factory=list, alias="guidelinePlan")
    findings: list[Any] = Field(default_factory=list)
    sources_used: list[str] = Field(default_factory=list, alias="sourcesUsed")
    headline: str | None = None
    recommendation: str | None = None
    plan_phase: dict | None = Field(default=None, alias="planPhase")

    model_config = {"populate_by_name": True, "extra": "ignore"}


class AgentRunStatus(BaseModel):
    run_id: str = Field(alias="runId")
    status: str
    session_id: str | None = Field(default=None, alias="sessionId")
    phase: int = 0
    progress: float = 0.0
    events: list[dict] = Field(default_factory=list)
    summary: str | None = None
    mode: str | None = None
    work_plan: list[Any] = Field(default_factory=list, alias="workPlan")
    guideline_plan: list[Any] = Field(default_factory=list, alias="guidelinePlan")
    findings: list[Any] = Field(default_factory=list)
    sources_used: list[str] = Field(default_factory=list, alias="sourcesUsed")
    headline: str | None = None
    recommendation: str | None = None
    plan_phase: dict | None = Field(default=None, alias="planPhase")

    model_config = {"populate_by_name": True, "extra": "ignore"}


class AllowedTool(BaseModel):
    name: str
    description: str | None = None
    server_id: str | None = Field(default=None, alias="serverId")
    server_name: str | None = Field(default=None, alias="serverName")

    model_config = {"populate_by_name": True}


class AllowedToolsResponse(BaseModel):
    tools: list[AllowedTool]
    mode: str | None = None
