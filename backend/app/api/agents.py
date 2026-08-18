from fastapi import APIRouter

from app.core.deps import CurrentUserId
from app.schemas.agents import AgentRunRequest, AgentRunResponse, AgentRunStatus
from app.services.agent_service import agent_service

router = APIRouter()


@router.post("/runs", response_model=AgentRunResponse)
async def start_run(payload: AgentRunRequest, _user_id: CurrentUserId) -> AgentRunResponse:
    result = await agent_service.start_run(payload.mission, payload.goal_id)
    return AgentRunResponse.model_validate(result)


@router.get("/runs/{run_id}", response_model=AgentRunStatus)
async def get_run(run_id: str, _user_id: CurrentUserId) -> AgentRunStatus:
    result = await agent_service.get_run(run_id)
    return AgentRunStatus.model_validate(result)
