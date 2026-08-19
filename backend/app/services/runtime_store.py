from datetime import datetime, timedelta, timezone

from app.schemas.overview import ActivityItem
from app.schemas.sources import IntegrationCatalogItem, Source
from app.services.seed_data import (
    INTEGRATION_CATALOG,
    SEED_ACTIVITY,
    SEED_GOALS,
    SEED_SOURCES,
    SEED_TASKS,
)


class RuntimeStore:
    """In-memory store used when USE_DATABASE=false."""

    def reset(self) -> None:
        self.goals = {goal.id: goal.model_copy(deep=True) for goal in SEED_GOALS if goal.id}
        self.sources = {source.id: source.model_copy(deep=True) for source in SEED_SOURCES}
        self.catalog = [item.model_copy(deep=True) for item in INTEGRATION_CATALOG]
        self.tasks = [task.model_copy(deep=True) for task in SEED_TASKS]
        self.activity = [item.model_copy(deep=True) for item in SEED_ACTIVITY]
        self.connections: dict[str, dict] = {}
        self.oauth_states: dict[str, dict] = {}

    def catalog_item(self, key: str) -> IntegrationCatalogItem | None:
        return next((item for item in self.catalog if item.id == key), None)

    def source(self, source_id: str) -> Source | None:
        return self.sources.get(source_id)

    def prepend_activity(self, item: ActivityItem) -> None:
        self.activity.insert(0, item)
        self.activity = self.activity[:50]


runtime_store = RuntimeStore()
runtime_store.reset()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def expires_in(minutes: int = 15) -> datetime:
    return utcnow() + timedelta(minutes=minutes)
