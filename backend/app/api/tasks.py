from fastapi import APIRouter, Query

from app.core.deps import CurrentUserId
from app.schemas.tasks import TaskListResponse
from app.services.task_service import task_service

router = APIRouter()


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    _user_id: CurrentUserId,
    goal_id: str | None = Query(default=None, alias="goalId"),
) -> TaskListResponse:
    return task_service.list_tasks(goal_id=goal_id)
