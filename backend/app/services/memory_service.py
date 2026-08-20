"""Long-term memory — MemoryService → TencentDB adapter or in-process mock."""

from app.adapters.memory_tencent import mock_memory_store, tencent_memory_client
from app.adapters.memory_tencent.client import normalize_memory_item
from app.core.config import Settings, get_settings


class MemoryService:
    def __init__(self, store=None, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        if store is not None:
            self._store = store
        elif self._settings.memory_mode == "live":
            self._store = tencent_memory_client
        else:
            self._store = mock_memory_store

    def _records(self, items: object) -> list[dict]:
        rows: list[dict] = []
        if not isinstance(items, list):
            return rows
        for item in items:
            mapped = normalize_memory_item(item, mode=self._settings.memory_mode)
            if mapped:
                rows.append(mapped)
        return rows

    async def store(self, *, title: str, content: str, source: str | None = None) -> dict:
        return await self._store.store(title=title, content=content, source=source)

    async def recall(self, memory_id: str) -> dict | None:
        result = await self._store.recall(memory_id)
        if result is None:
            return None
        return normalize_memory_item(result, fallback_id=memory_id, mode=self._settings.memory_mode)

    async def search(self, query: str) -> dict:
        items = self._records(await self._store.search(query))
        return {"items": items, "total": len(items), "mode": self._settings.memory_mode}

    async def update(self, memory_id: str, **fields: object) -> dict | None:
        result = await self._store.update(memory_id, **fields)
        if result is None:
            return None
        return normalize_memory_item(result, fallback_id=memory_id, mode=self._settings.memory_mode)

    async def delete(self, memory_id: str) -> dict:
        deleted = await self._store.delete(memory_id)
        return {"deleted": bool(deleted), "id": memory_id}

    async def list_proposals(self) -> dict:
        return {
            "proposals": [
                {
                    "id": "mem-1",
                    "title": "Preferred morning focus window",
                    "summary": "User completes deep work best between 8:30 and 10:00.",
                    "source": "Calendar + fitness",
                    "confidence": 0.82,
                }
            ],
            "total": 1,
        }


memory_service = MemoryService()
