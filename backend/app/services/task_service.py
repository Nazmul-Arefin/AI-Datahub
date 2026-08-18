from app.schemas.tasks import ExecutionTask, TaskListResponse
from app.services.seed_data import SEED_TASKS


class TaskService:
    def list_tasks(self, goal_id: str | None = None) -> TaskListResponse:
        tasks: list[ExecutionTask] = SEED_TASKS
        if goal_id:
            tasks = [task for task in tasks if task.goal_id == goal_id]
        return TaskListResponse(tasks=tasks, total=len(tasks))


task_service = TaskService()
