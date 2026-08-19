from app.services.goal_service import goal_service
from app.services.source_service import source_service


def main() -> None:
    goals = goal_service.list_goals()
    sources = source_service.list_sources()
    catalog = source_service.integration_catalog()
    print(f"Goals: {goals.total}")
    print(f"Sources: {sources.total}")
    print(f"Catalog: {catalog.total}")


if __name__ == "__main__":
    main()
