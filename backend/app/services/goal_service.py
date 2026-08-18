from app.schemas.goals import Goal, GoalListResponse, GoalUpdateRequest
from app.services.seed_data import SEED_GOALS


class GoalService:
    def __init__(self) -> None:
        self._goals: dict[str, Goal] = {
            (goal.id or goal.title): goal.model_copy(deep=True) for goal in SEED_GOALS
        }

    def list_goals(self) -> GoalListResponse:
        goals = list(self._goals.values())
        return GoalListResponse(goals=goals, total=len(goals))

    def get_goal(self, goal_id: str) -> Goal | None:
        return self._goals.get(goal_id)

    def update_goal(self, goal_id: str, payload: GoalUpdateRequest) -> Goal | None:
        goal = self._goals.get(goal_id)
        if not goal:
            return None
        data = goal.model_dump(by_alias=True)
        patch = payload.model_dump(exclude_unset=True, by_alias=True)
        data.update(patch)
        updated = Goal.model_validate(data)
        self._goals[goal_id] = updated
        return updated


goal_service = GoalService()
