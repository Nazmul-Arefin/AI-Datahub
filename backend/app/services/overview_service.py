from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from app.models.goal import Goal as GoalRow
from app.models.source import DataSource
from app.schemas.overview import CalendarTask, OverviewCluster, OverviewResponse
from app.schemas.tasks import ExecutionTask
from app.services.activity_service import activity_service
from app.services.goal_service import goal_service
from app.services.runtime_store import runtime_store
from app.services.source_service import source_service
from app.services.task_service import task_service


def _today() -> date:
    return datetime.now(timezone.utc).astimezone().date()


def _time_from_due(due_at: str | None) -> str | None:
    if not due_at:
        return None
    text = str(due_at).strip()
    if "T" in text:
        return text.split("T", 1)[1][:5]
    if text.startswith("T") and len(text) >= 6:
        return text[1:6]
    if len(text) >= 5 and text[2] == ":":
        return text[:5]
    return None


def _day_offset_from_due(due_at: str | None) -> int:
    """Map task due times onto calendar day offsets from local today.

    Supported forms:
    - `T14:00` / `14:00` → today (0)
    - `+1T19:00` / `-1T09:00` → relative day + time
    - `2026-08-21T14:00` / `2026-08-21` → absolute date
    """
    if not due_at:
        return 0
    text = str(due_at).strip()
    if not text:
        return 0

    # Relative: +2T14:00 or -1T09:30
    if len(text) > 1 and text[0] in "+-" and "T" in text:
        sign = 1 if text[0] == "+" else -1
        day_part, _time_part = text[1:].split("T", 1)
        try:
            return sign * int(day_part or "0")
        except ValueError:
            return 0

    # Absolute ISO date (with or without time)
    date_part = text[:10] if len(text) >= 10 and text[4] == "-" else None
    if date_part:
        try:
            due_day = date.fromisoformat(date_part)
            return (due_day - _today()).days
        except ValueError:
            return 0

    return 0


def _calendar_from_task(task: ExecutionTask) -> CalendarTask:
    owner = "ai" if task.owner == "ai" else "human"
    time = _time_from_due(task.due_at)
    day_offset = _day_offset_from_due(task.due_at)
    state = (task.state or "").lower()
    done = state in {"completed", "done", "ready", "confirmed"}
    awaiting = any(token in state for token in ("need", "await", "confirm", "pending")) and not done
    if owner == "ai":
        if done:
            label, item_type, status, icon = "AI COMPLETED", "complete", "Ready", "check"
            detail = task.subgoal_name or "Weeple finished this for you"
        elif awaiting:
            label, item_type, status, icon = "AI NEEDS CONFIRM", "planning", "Confirm", "alert"
            detail = task.subgoal_name or "Confirm so Weeple can continue"
        else:
            label, item_type, status, icon = "AI TASK", "planning", "Queued", "spark"
            detail = task.subgoal_name or "Weeple is handling this for you"
        title = task.name
    else:
        if awaiting:
            label, item_type, status, icon = "NEEDS YOUR ACTION", "action", "Confirm", "alert"
        else:
            label, item_type, status, icon = "YOUR TASK", "action", task.state or "To do", "target"
        detail = task.subgoal_name or "Added for you"
        title = f"{task.name} · {time}" if awaiting and time and "·" not in task.name else task.name
    return CalendarTask(
        id=f"task-{task.id}",
        title=title,
        time=time,
        dayOffset=day_offset,
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
    def get_overview(self, db: Session | None = None, user_id: str | None = None) -> OverviewResponse:
        from app.services.seed_data import ADMIN_USER_ID

        uid = user_id or ADMIN_USER_ID
        goals = goal_service.list_goals(db=db, user_id=uid).goals
        memory_count = sum(int(goal.memories or 0) for goal in goals)
        if db is not None:
            goal_count = db.query(GoalRow).filter(GoalRow.user_id == uid).count()
            source_count = db.query(DataSource).filter(DataSource.user_id == uid).count()
        else:
            goal_count = len(goal_service.list_goals(db=None, user_id=uid).goals)
            source_count = len(source_service.list_sources(db=None, user_id=uid).sources)

        clusters = [
            OverviewCluster(key="goals", title="Goal Management", count=goal_count),
            OverviewCluster(key="data", title="Personal Data", count=source_count),
            OverviewCluster(key="memory", title="Long-term Memory", count=memory_count),
        ]

        by_id: dict[str, CalendarTask] = {}

        for goal in goals:
            mapped = _calendar_from_goal(goal)
            if mapped:
                by_id[mapped.id] = mapped

        for task in task_service.list_tasks(db=db, user_id=uid).tasks:
            mapped = _calendar_from_task(task)
            by_id[mapped.id] = mapped

        calendar_tasks = sorted(
            by_id.values(),
            key=lambda item: (item.day_offset, item.time or "99:99", item.id),
        )
        return OverviewResponse(
            clusters=clusters,
            calendarTasks=calendar_tasks,
            activity=activity_service.list_recent(db=db, user_id=uid),
        )


overview_service = OverviewService()
