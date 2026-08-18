"""Print seed goal/source counts for smoke checks."""

from app.services.goal_service import goal_service
from app.services.source_service import source_service


def main() -> None:
    goals = goal_service.list_goals()
    sources = source_service.list_sources()
    print(f"Goals: {goals.total}")
    print(f"Sources: {sources.total}")


if __name__ == "__main__":
    main()
