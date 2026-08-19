from sqlalchemy.orm import Session

from app.models.goal import ExecutionTask as TaskRow
from app.schemas.tasks import ExecutionTask, TaskListResponse, TaskUpdateRequest
from app.services.runtime_store import runtime_store


def _task_from_row(row: TaskRow) -> ExecutionTask:
    return ExecutionTask(
        id=row.id,
        goalId=row.goal_id,
        name=row.name,
        state=row.state,
        dueAt=row.due_at,
        subgoalName=row.subgoal_name,
    )


class TaskService:
    def list_tasks(self, goal_id: str | None = None, db: Session | None = None) -> TaskListResponse:
        if db is not None:
            query = db.query(TaskRow)
            if goal_id:
                query = query.filter(TaskRow.goal_id == goal_id)
            tasks = [_task_from_row(row) for row in query.order_by(TaskRow.created_at, TaskRow.id).all()]
        else:
            tasks = list(runtime_store.tasks)
            if goal_id:
                tasks = [task for task in tasks if task.goal_id == goal_id]
        return TaskListResponse(tasks=tasks, total=len(tasks))

    def update_task(
        self, task_id: str, payload: TaskUpdateRequest, db: Session | None = None
    ) -> ExecutionTask | None:
        patch = payload.model_dump(exclude_unset=True)
        if db is not None:
            row = db.get(TaskRow, task_id)
            if not row:
                return None
            if "name" in patch:
                row.name = patch["name"]
            if "state" in patch:
                row.state = patch["state"]
            if "due_at" in patch:
                row.due_at = patch["due_at"]
            if "subgoal_name" in patch:
                row.subgoal_name = patch["subgoal_name"]
            return _task_from_row(row)

        for index, task in enumerate(runtime_store.tasks):
            if task.id != task_id:
                continue
            data = task.model_dump(by_alias=True)
            data.update(payload.model_dump(exclude_unset=True, by_alias=True))
            updated = ExecutionTask.model_validate(data)
            runtime_store.tasks[index] = updated
            return updated
        return None


task_service = TaskService()
