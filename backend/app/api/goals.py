from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUserId
from app.schemas.goals import Goal, GoalListResponse, GoalUpdateRequest
from app.services.goal_service import goal_service

router = APIRouter()


@router.get("", response_model=GoalListResponse)
async def list_goals(_user_id: CurrentUserId) -> GoalListResponse:
    return goal_service.list_goals()


@router.get("/{goal_id}", response_model=Goal)
async def get_goal(goal_id: str, _user_id: CurrentUserId) -> Goal:
    goal = goal_service.get_goal(goal_id)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.patch("/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: str,
    payload: GoalUpdateRequest,
    _user_id: CurrentUserId,
) -> Goal:
    goal = goal_service.update_goal(goal_id, payload)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal
