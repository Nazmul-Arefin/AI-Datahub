from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.goal import Goal as GoalRow
from app.schemas.goals import Goal, GoalCreateRequest, GoalListResponse, GoalPrediction, GoalUpdateRequest
from app.services.activity_service import activity_service
from app.services.runtime_store import runtime_store


def _sync_progress_from_subgoals(goal: Goal) -> Goal:
    """Progress is always derived from subgoal done/total when subgoals exist."""
    if not goal.subgoals:
        return goal
    completed = sum(max(0, int(item.done)) for item in goal.subgoals)
    tasks = sum(max(0, int(item.total)) for item in goal.subgoals)
    goal.progress = int(round(completed / max(1, tasks) * 100))
    goal.completed = completed
    goal.tasks = tasks
    return goal


def _sync_prediction_from_state(goal: Goal) -> Goal:
    """Deterministic likelihood from completion + schedule pressure (offline fallback)."""
    if goal.prediction and getattr(goal.prediction, "agent_generated", None):
        return goal
    progress = max(0, min(100, int(goal.progress or 0)))
    offset = goal.schedule_offset
    score = 42.0 + progress * 0.38
    if offset is not None:
        if offset < 0:
            score -= 18
        elif offset == 0:
            score -= 10 if progress < 70 else -4
        elif offset == 1:
            score -= 6 if progress < 50 else 0
        elif offset >= 7:
            score += 6
    open_steps = max(0, (goal.tasks or 0) - (goal.completed or 0))
    score -= min(14, open_steps * 1.4)
    if goal.monitoring_paused:
        score -= 12
    if goal.sources:
        score += min(8, goal.sources * 0.7)
    probability = int(max(8, min(96, round(score))))
    if probability >= 80:
        risk, confidence = "POSITIVE WINDOW", "High confidence"
    elif probability >= 65:
        risk, confidence = "ON TRACK", "Medium-high confidence"
    elif probability >= 45:
        risk, confidence = "WATCH", "Medium confidence"
    else:
        risk, confidence = "AT RISK", "Needs attention"
    window = "Next review"
    if offset is not None:
        if offset < 0:
            window = "Overdue"
        elif offset == 0:
            window = "Today"
        elif offset == 1:
            window = "Tomorrow"
        else:
            window = f"In {offset} days"
    impact = "Next milestone"
    if goal.subgoals:
        open_subgoal = next((item for item in goal.subgoals if item.done < item.total), None)
        if open_subgoal:
            impact = open_subgoal.name
    title = (
        f"At {progress}% completion, the current plan is {probability}% likely to hold through {window.lower()}."
        if progress
        else f"Early signals put success likelihood near {probability}% for {window.lower()}."
    )
    goal.prediction = GoalPrediction(
        probability=probability,
        risk=risk,
        title=title,
        impact=impact,
        window=window,
        confidence=confidence,
        agent_generated=False,
    )
    return goal


def _hydrate_goal_metrics(goal: Goal) -> Goal:
    _sync_progress_from_subgoals(goal)
    # Keep agent-authored observations; only fill prediction when no agent forecast exists.
    if not any(getattr(item, "agent_generated", None) for item in (goal.observations or [])):
        pass
    _sync_prediction_from_state(goal)
    return goal


def _goal_from_row(row: GoalRow) -> Goal:
    goal = Goal.model_validate(
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
            "imageUrl": getattr(row, "image_url", None),
            "imageStatus": getattr(row, "image_status", None) or "idle",
        }
    )
    return _hydrate_goal_metrics(goal)


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
    row.image_url = goal.image_url
    row.image_status = goal.image_status or "idle"


class GoalService:
    def list_goals(self, db: Session | None = None) -> GoalListResponse:
        if db is not None:
            rows = db.query(GoalRow).order_by(GoalRow.created_at, GoalRow.id).all()
            goals = [_goal_from_row(row) for row in rows]
        else:
            goals = [_hydrate_goal_metrics(goal.model_copy(deep=True)) for goal in runtime_store.goals.values()]
        return GoalListResponse(goals=goals, total=len(goals))

    def get_goal(self, goal_id: str, db: Session | None = None) -> Goal | None:
        if db is not None:
            row = db.get(GoalRow, goal_id)
            return _goal_from_row(row) if row else None
        goal = runtime_store.goals.get(goal_id)
        return _hydrate_goal_metrics(goal.model_copy(deep=True)) if goal else None

    def create_goal(self, payload: GoalCreateRequest, db: Session | None = None) -> Goal:
        goal_id = f"goal-{uuid4().hex[:8]}"
        image_status = "generating" if settings.coze_enabled else "idle"
        if image_status == "idle":
            import logging

            logging.getLogger(__name__).info(
                "Goal artwork skipped (set COZE_API_TOKEN and COZE_MODE=live in backend/.env)"
            )
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
            imageUrl=None,
            imageStatus=image_status,
        )
        _hydrate_goal_metrics(goal)
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

    def set_goal_artwork(
        self,
        goal_id: str,
        image_url: str | None,
        image_status: str,
        db: Session | None = None,
    ) -> Goal | None:
        goal = self.get_goal(goal_id, db=db)
        if not goal:
            return None
        goal.image_url = image_url
        goal.image_status = image_status
        if db is not None:
            row = db.get(GoalRow, goal_id)
            if not row:
                return None
            row.image_url = image_url
            row.image_status = image_status
        else:
            runtime_store.goals[goal_id] = goal
        return goal

    def update_goal(self, goal_id: str, payload: GoalUpdateRequest, db: Session | None = None) -> Goal | None:
        goal = self.get_goal(goal_id, db=db)
        if not goal:
            return None
        previous_status = goal.status
        data = goal.model_dump(by_alias=True)
        data.update(payload.model_dump(exclude_unset=True, by_alias=True))
        updated = _hydrate_goal_metrics(Goal.model_validate(data))
        if db is not None:
            row = db.get(GoalRow, goal_id)
            if not row:
                return None
            _apply_goal_row(row, updated)
        else:
            runtime_store.goals[goal_id] = updated
        if payload.status is not None and updated.status != previous_status:
            activity_service.record(
                f"{updated.title} status updated",
                f"Moved from {previous_status} to {updated.status}",
                route="goals",
                related_goal_id=goal_id,
                db=db,
            )
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
