"""In-process memory store used when MEMORY_MODE=mock."""

from __future__ import annotations

from uuid import uuid4


class MockMemoryStore:
    def __init__(self) -> None:
        self._items: dict[str, dict] = {}

    async def store(self, *, title: str, content: str, source: str | None = None) -> dict:
        item = {
            "id": f"mem-{uuid4()}",
            "title": title,
            "content": content,
            "source": source,
            "mode": "mock",
        }
        self._items[item["id"]] = item
        return dict(item)

    async def recall(self, memory_id: str) -> dict | None:
        item = self._items.get(memory_id)
        return dict(item) if item else None

    async def search(self, query: str) -> list[dict]:
        needle = query.lower()
        return [
            dict(item)
            for item in self._items.values()
            if needle in item["title"].lower() or needle in item["content"].lower()
        ]

    async def update(self, memory_id: str, **fields: str) -> dict | None:
        item = self._items.get(memory_id)
        if not item:
            return None
        allowed = {"title", "content", "source"}
        for key, value in fields.items():
            if key in allowed and value is not None:
                item[key] = value
        return dict(item)

    async def delete(self, memory_id: str) -> bool:
        return self._items.pop(memory_id, None) is not None


mock_memory_store = MockMemoryStore()
