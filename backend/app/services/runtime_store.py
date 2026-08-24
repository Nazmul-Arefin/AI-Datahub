from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.schemas.overview import ActivityItem
from app.schemas.sources import IntegrationCatalogItem, Source
from app.services.seed_data import (
    ADMIN_USER_ID,
    INTEGRATION_CATALOG,
    SEED_ACTIVITY,
    SEED_GOALS,
    SEED_SOURCES,
    SEED_TASKS,
    SOURCE_CATALOG_KEYS,
)


def source_store_key(user_id: str, source_id: str) -> str:
    return f"{user_id}::{source_id}"


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def expires_in(minutes: int = 15) -> datetime:
    return utcnow() + timedelta(minutes=minutes)


class RuntimeStore:
    """In-memory store used when USE_DATABASE=false."""

    def reset(self) -> None:
        mock = settings.use_mock_data
        self.goals = {goal.id: goal.model_copy(deep=True) for goal in SEED_GOALS if goal.id} if mock else {}
        self.goal_owners: dict[str, str] = {goal_id: ADMIN_USER_ID for goal_id in self.goals}
        self.sources: dict[str, Source] = {}
        if mock:
            self.sources = {
                source_store_key(ADMIN_USER_ID, source.id): source.model_copy(deep=True)
                for source in SEED_SOURCES
            }
        self.catalog = [item.model_copy(deep=True) for item in INTEGRATION_CATALOG]
        self.tasks = [task.model_copy(deep=True) for task in SEED_TASKS] if mock else []
        self.task_owners: dict[str, str] = {task.id: ADMIN_USER_ID for task in self.tasks}
        self.activity = [item.model_copy(deep=True) for item in SEED_ACTIVITY] if mock else []
        self.activity_owners: list[str] = [ADMIN_USER_ID] * len(self.activity)
        self.connections: dict[str, dict] = self._seed_connections() if mock else {}
        self.oauth_states: dict[str, dict] = {}
        self.settings: dict[str, object] = {}
        self.users: dict[str, dict] = {}
        self.synced_assets: dict[str, dict[str, dict]] = {}

    def _seed_connections(self) -> dict[str, dict]:
        connections: dict[str, dict] = {}
        for source in SEED_SOURCES:
            catalog_key = SOURCE_CATALOG_KEYS.get(source.id)
            if not source.connection_id or catalog_key is None:
                continue
            connections[source.connection_id] = {
                "id": source.connection_id,
                "user_id": ADMIN_USER_ID,
                "catalog_key": catalog_key,
                "auth_provider": "nango",
                "external_connection_id": None,
                "status": "connected",
                "connected_at": utcnow(),
            }
        return connections

    def catalog_item(self, key: str) -> IntegrationCatalogItem | None:
        return next((item for item in self.catalog if item.id == key), None)

    def source(self, source_id: str, user_id: str = ADMIN_USER_ID) -> Source | None:
        return self.sources.get(source_store_key(user_id, source_id)) or self.sources.get(source_id)

    def list_user_sources(self, user_id: str) -> list[Source]:
        prefix = f"{user_id}::"
        owned = [source for key, source in self.sources.items() if key.startswith(prefix)]
        if owned:
            return owned
        if user_id == ADMIN_USER_ID:
            return [source for key, source in self.sources.items() if "::" not in key]
        return []

    def prepend_activity(self, item: ActivityItem, user_id: str = ADMIN_USER_ID) -> None:
        self.activity.insert(0, item)
        self.activity_owners.insert(0, user_id)
        self.activity = self.activity[:50]
        self.activity_owners = self.activity_owners[:50]


runtime_store = RuntimeStore()
runtime_store.reset()
