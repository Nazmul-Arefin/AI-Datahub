from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUserId, DbSession
from app.schemas.tasks import ExecutionTask, TaskCreateRequest, TaskListResponse, TaskUpdateRequest
from app.services.task_service import task_service

router = APIRouter()


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: CurrentUserId,
    db: DbSession,
    goal_id: str | None = Query(default=None, alias="goalId"),
) -> TaskListResponse:
    return task_service.list_tasks(goal_id=goal_id, db=db, user_id=user_id)


@router.post("", response_model=ExecutionTask, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreateRequest,
    user_id: CurrentUserId,
    db: DbSession,
) -> ExecutionTask:
    return task_service.create_task(payload, db=db, user_id=user_id)


@router.patch("/{task_id}", response_model=ExecutionTask)
async def update_task(
    task_id: str,
    payload: TaskUpdateRequest,
    user_id: CurrentUserId,
    db: DbSession,
) -> ExecutionTask:
    task = task_service.update_task(task_id, payload, db=db, user_id=user_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task
