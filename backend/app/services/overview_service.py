from sqlalchemy.orm import Session

from app.models.goal import Goal as GoalRow
from app.models.source import DataSource
from app.schemas.overview import CalendarTask, OverviewCluster, OverviewResponse
from app.schemas.tasks import ExecutionTask
from app.services.activity_service import activity_service
from app.services.goal_service import goal_service
from app.services.runtime_store import runtime_store
from app.services.seed_data import OVERVIEW_CALENDAR
from app.services.source_service import source_service
from app.services.task_service import task_service


def _time_from_due(due_at: str | None) -> str | None:
    if not due_at:
        return None
    text = str(due_at)
    if "T" in text:
        return text.split("T", 1)[1][:5]
    if text.startswith("T") and len(text) >= 6:
        return text[1:6]
    if len(text) >= 5 and text[2] == ":":
        return text[:5]
    return None


def _calendar_from_task(task: ExecutionTask) -> CalendarTask:
    owner = "ai" if task.owner == "ai" else "human"
    time = _time_from_due(task.due_at)
    done = task.state.lower() in {"completed", "done", "ready"}
    needs = "need" in task.state.lower() or "action" in task.state.lower()
    if owner == "ai":
        label = "AI COMPLETED" if done else "AI TASK"
        item_type = "complete" if done else "planning"
        status = "Ready" if done else "Queued"
        icon = "check" if done else "spark"
        detail = task.subgoal_name or "Weeple is handling this for you"
        title = task.name
    else:
        label = "NEEDS YOUR ACTION" if needs else "YOUR TASK"
        item_type = "action"
        status = "Confirm" if needs else task.state
        icon = "alert" if needs else "target"
        detail = task.subgoal_name or "Added for you"
        title = f"{task.name} · {time}" if needs and time and "·" not in task.name else task.name
    return CalendarTask(
        id=f"task-{task.id}",
        title=title,
        time=time,
        dayOffset=0,
        owner=owner,
        label=label,
        detail=detail,
        status=status,
        type=item_type,
        goalId=task.goal_id,
        icon=icon,
    )


def _calendar_from_goal(goal) -> CalendarTask | None:
    if not (goal.scheduled_time or goal.schedule_offset is not None):
        return None
    return CalendarTask(
        id=f"cal-{goal.id}",
        title=f"{goal.scheduled_time + ' · ' if goal.scheduled_time else ''}{goal.title}",
        time=goal.scheduled_time,
        dayOffset=goal.schedule_offset or 0,
        owner="human",
        label="SCHEDULED GOAL",
        detail="Tap to open this goal and its current context",
        status=f"{goal.progress}%",
        type="goal",
        goalId=goal.id,
        icon="target",
    )


class OverviewService:
    def get_overview(self, db: Session | None = None) -> OverviewResponse:
        goals = goal_service.list_goals(db=db).goals
        memory_count = sum(goal.memories for goal in goals) or 128
        if db is not None:
            goal_count = db.query(GoalRow).count()
            source_count = db.query(DataSource).count()
        else:
            goal_count = len(runtime_store.goals)
            source_count = len(runtime_store.sources)

        clusters = [
            OverviewCluster(key="goals", title="Goal Management", count=goal_count),
            OverviewCluster(key="data", title="Personal Data", count=source_count),
            OverviewCluster(key="memory", title="Long-term Memory", count=memory_count),
        ]

        by_id: dict[str, CalendarTask] = {item.id: item for item in OVERVIEW_CALENDAR}

        for goal in goals:
            mapped = _calendar_from_goal(goal)
            if mapped:
                by_id[mapped.id] = mapped

        for task in task_service.list_tasks(db=db).tasks:
            mapped = _calendar_from_task(task)
            by_id[mapped.id] = mapped

        calendar_tasks = sorted(
            by_id.values(),
            key=lambda item: (item.day_offset, item.time or "99:99", item.id),
        )
        return OverviewResponse(
            clusters=clusters,
            calendarTasks=calendar_tasks,
            activity=activity_service.list_recent(db=db),
        )


overview_service = OverviewService()
