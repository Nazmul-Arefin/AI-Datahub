from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.goal import Goal as GoalRow
from app.schemas.goals import Goal, GoalCreateRequest, GoalListResponse, GoalUpdateRequest
from app.services.activity_service import activity_service
from app.services.runtime_store import runtime_store


def _goal_from_row(row: GoalRow) -> Goal:
    return Goal.model_validate(
        {
            "id": row.id,
            "title": row.title,
            "short": row.short,
            "status": row.status,
            "progress": row.progress,
            "scheduleOffset": row.schedule_offset,
            "scheduledTime": row.scheduled_time,
            "description": row.description,
            "sources": row.sources,
            "memories": row.memories,
            "outputs": row.outputs,
            "tasks": row.tasks,
            "completed": row.completed,
            "accent": row.accent,
            "category": row.category,
            "updated": row.updated,
            "subgoals": row.subgoals or [],
            "taskLabels": row.task_labels or [],
            "recommendation": row.recommendation,
            "basis": row.basis or [],
            "observations": row.observations or [],
            "prediction": row.prediction,
            "suggestions": row.suggestions or [],
            "monitoringPaused": row.monitoring_paused,
            "custom": row.custom,
        }
    )


def _apply_goal_row(row: GoalRow, goal: Goal) -> None:
    row.title = goal.title
    row.short = goal.short
    row.status = goal.status
    row.progress = goal.progress
    row.schedule_offset = goal.schedule_offset
    row.scheduled_time = goal.scheduled_time
    row.description = goal.description
    row.sources = goal.sources
    row.memories = goal.memories
    row.outputs = goal.outputs
    row.tasks = goal.tasks
    row.completed = goal.completed
    row.accent = goal.accent
    row.category = goal.category
    row.updated = goal.updated
    row.subgoals = [item.model_dump() for item in goal.subgoals]
    row.task_labels = list(goal.task_labels)
    row.recommendation = goal.recommendation
    row.basis = list(goal.basis)
    row.observations = [item.model_dump() for item in goal.observations]
    row.prediction = goal.prediction.model_dump() if goal.prediction else None
    row.suggestions = [item.model_dump() for item in goal.suggestions]
    row.monitoring_paused = goal.monitoring_paused
    row.custom = goal.custom


class GoalService:
    def list_goals(self, db: Session | None = None) -> GoalListResponse:
        if db is not None:
            goals = [_goal_from_row(row) for row in db.query(GoalRow).order_by(GoalRow.created_at).all()]
        else:
            goals = list(runtime_store.goals.values())
        return GoalListResponse(goals=goals, total=len(goals))

    def get_goal(self, goal_id: str, db: Session | None = None) -> Goal | None:
        if db is not None:
            row = db.get(GoalRow, goal_id)
            return _goal_from_row(row) if row else None
        return runtime_store.goals.get(goal_id)

    def create_goal(self, payload: GoalCreateRequest, db: Session | None = None) -> Goal:
        goal_id = f"goal-{uuid4().hex[:8]}"
        goal = Goal(
            id=goal_id,
            title=payload.title,
            short=payload.short or payload.title,
            status=payload.status,
            progress=payload.progress,
            scheduleOffset=payload.schedule_offset,
            scheduledTime=payload.scheduled_time,
            description=payload.description,
            accent=payload.accent,
            category=payload.category,
            subgoals=payload.subgoals,
            taskLabels=payload.task_labels,
            custom=payload.custom,
        )
        if db is not None:
            row = GoalRow(id=goal_id)
            _apply_goal_row(row, goal)
            db.add(row)
        else:
            runtime_store.goals[goal_id] = goal
        activity_service.record(
            "Goal created",
            f"{goal.title} is now tracked",
            route="goals",
            related_goal_id=goal_id,
            db=db,
        )
        return goal

    def update_goal(self, goal_id: str, payload: GoalUpdateRequest, db: Session | None = None) -> Goal | None:
        goal = self.get_goal(goal_id, db=db)
        if not goal:
            return None
        data = goal.model_dump(by_alias=True)
        data.update(payload.model_dump(exclude_unset=True, by_alias=True))
        updated = Goal.model_validate(data)
        if db is not None:
            row = db.get(GoalRow, goal_id)
            if not row:
                return None
            _apply_goal_row(row, updated)
        else:
            runtime_store.goals[goal_id] = updated
        if payload.monitoring_paused is not None:
            activity_service.record(
                "Goal monitoring updated",
                f"{updated.title} monitoring {'paused' if updated.monitoring_paused else 'resumed'}",
                route="goals",
                related_goal_id=goal_id,
                db=db,
            )
        return updated

    def delete_goal(self, goal_id: str, db: Session | None = None) -> bool:
        if db is not None:
            row = db.get(GoalRow, goal_id)
            if not row:
                return False
            db.delete(row)
            return True
        if goal_id not in runtime_store.goals:
            return False
        del runtime_store.goals[goal_id]
        return True


goal_service = GoalService()
