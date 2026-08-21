from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.core.deps import CurrentUserId, DbSession
from app.schemas.goals import Goal, GoalCreateRequest, GoalListResponse, GoalUpdateRequest
from app.services.goal_artwork_job import run_goal_artwork_job
from app.services.goal_service import goal_service

router = APIRouter()


@router.get("", response_model=GoalListResponse)
async def list_goals(_user_id: CurrentUserId, db: DbSession) -> GoalListResponse:
    return goal_service.list_goals(db=db)


@router.post("", response_model=Goal, status_code=status.HTTP_201_CREATED)
async def create_goal(
    payload: GoalCreateRequest,
    _user_id: CurrentUserId,
    db: DbSession,
    background_tasks: BackgroundTasks,
) -> Goal:
    goal = goal_service.create_goal(payload, db=db)
    if goal.image_status == "generating":
        background_tasks.add_task(run_goal_artwork_job, goal.id)
    return goal


@router.get("/{goal_id}", response_model=Goal)
async def get_goal(goal_id: str, _user_id: CurrentUserId, db: DbSession) -> Goal:
    goal = goal_service.get_goal(goal_id, db=db)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.patch("/{goal_id}", response_model=Goal)
async def update_goal(
    goal_id: str,
    payload: GoalUpdateRequest,
    _user_id: CurrentUserId,
    db: DbSession,
) -> Goal:
    goal = goal_service.update_goal(goal_id, payload, db=db)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(goal_id: str, _user_id: CurrentUserId, db: DbSession) -> None:
    if not goal_service.delete_goal(goal_id, db=db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
