from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUserId
from app.schemas.agents import (
    AgentRunRequest,
    AgentRunResponse,
    AgentRunStatus,
    AllowedToolsResponse,
)
from app.services.agent_service import agent_service

router = APIRouter()


@router.get("/tools", response_model=AllowedToolsResponse)
async def list_allowed_tools(_user_id: CurrentUserId) -> AllowedToolsResponse:
    result = await agent_service.list_allowed_tools()
    return AllowedToolsResponse.model_validate(result)


@router.post("/runs", response_model=AgentRunResponse)
async def start_run(payload: AgentRunRequest, _user_id: CurrentUserId) -> AgentRunResponse:
    result = await agent_service.run(payload.mission, payload.goal_id)
    return AgentRunResponse.model_validate(result)


@router.get("/runs/{run_id}", response_model=AgentRunStatus)
async def get_run(run_id: str, _user_id: CurrentUserId) -> AgentRunStatus:
    result = await agent_service.get_run(run_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent run not found")
    return AgentRunStatus.model_validate(result)
