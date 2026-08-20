from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.goal import ExecutionTask as TaskRow
from app.schemas.tasks import ExecutionTask, TaskCreateRequest, TaskListResponse, TaskUpdateRequest
from app.services.runtime_store import runtime_store


def _task_from_row(row: TaskRow) -> ExecutionTask:
    owner = "ai" if str(row.id).startswith("task-ai") else "human"
    return ExecutionTask(
        id=row.id,
        goalId=row.goal_id,
        name=row.name,
        state=row.state,
        dueAt=row.due_at,
        subgoalName=row.subgoal_name,
        owner=owner,
    )


class TaskService:
    def create_task(self, payload: TaskCreateRequest, db: Session | None = None) -> ExecutionTask:
        owner = payload.owner if payload.owner in {"human", "ai"} else "human"
        task_id = f"task-{'ai' if owner == 'ai' else 'human'}-{uuid4().hex[:10]}"
        task = ExecutionTask(
            id=task_id,
            goalId=payload.goal_id,
            name=payload.name,
            state=payload.state or "Pending",
            dueAt=payload.due_at,
            subgoalName=payload.subgoal_name,
            owner=owner,
        )
        if db is not None:
            db.add(
                TaskRow(
                    id=task.id,
                    goal_id=task.goal_id,
                    name=task.name,
                    state=task.state,
                    due_at=task.due_at,
                    subgoal_name=task.subgoal_name,
                )
            )
            db.flush()
        else:
            runtime_store.tasks.insert(0, task.model_copy(deep=True))

        from app.services.activity_service import activity_service

        activity_service.record(
            "Task created",
            f"“{task.name}” was added to the calendar",
            route="overview",
            related_goal_id=task.goal_id,
            db=db,
        )
        return task.model_copy(deep=True)

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
            updated = _task_from_row(row)
        else:
            updated = None
            for index, task in enumerate(runtime_store.tasks):
                if task.id != task_id:
                    continue
                data = task.model_dump(by_alias=True)
                data.update(payload.model_dump(exclude_unset=True, by_alias=True))
                updated = ExecutionTask.model_validate(data)
                runtime_store.tasks[index] = updated
                break
            if updated is None:
                return None

        # Calendar Confirm → keep overview/activity in sync
        if str(patch.get("state") or "").lower() in {"confirmed", "active", "completed", "done"}:
            from app.services.activity_service import activity_service

            activity_service.record(
                "Task confirmed",
                f"“{updated.name}” was confirmed from the calendar",
                route="overview",
                related_goal_id=updated.goal_id,
                db=db,
            )
        return updated


task_service = TaskService()
