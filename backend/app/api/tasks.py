from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUserId, DbSession
from app.schemas.tasks import ExecutionTask, TaskListResponse, TaskUpdateRequest
from app.services.task_service import task_service

router = APIRouter()


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    _user_id: CurrentUserId,
    db: DbSession,
    goal_id: str | None = Query(default=None, alias="goalId"),
) -> TaskListResponse:
    return task_service.list_tasks(goal_id=goal_id, db=db)


@router.patch("/{task_id}", response_model=ExecutionTask)
async def update_task(
    task_id: str,
    payload: TaskUpdateRequest,
    _user_id: CurrentUserId,
    db: DbSession,
) -> ExecutionTask:
    task = task_service.update_task(task_id, payload, db=db)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task
