"""In-process memory store used when MEMORY_MODE=mock."""

from __future__ import annotations

from uuid import uuid4


class MockMemoryStore:
    def __init__(self) -> None:
        self._items: dict[str, dict] = {
            "mem-product-outcome": {
                "id": "mem-product-outcome",
                "title": "Product outcome",
                "content": "Wants the personal AI product to produce a verifiable first result quickly.",
                "source": "Confirmed from goal setup",
                "mode": "mock",
                "use_for_ai": True,
            },
            "mem-deep-work": {
                "id": "mem-deep-work",
                "title": "Deep-work preference",
                "content": "Best focus time is 9:30–11:30 on weekdays.",
                "source": "Confirmed from calendar pattern",
                "mode": "mock",
                "use_for_ai": True,
            },
            "mem-family-planning": {
                "id": "mem-family-planning",
                "title": "Family planning preference",
                "content": "Protect Sunday afternoon for shared family time when possible.",
                "source": "User-confirmed correction",
                "mode": "mock",
                "use_for_ai": True,
            },
            "mem-recommendation-style": {
                "id": "mem-recommendation-style",
                "title": "Recommendation style",
                "content": "Prefers concise recommendations with evidence and one clear next action.",
                "source": "Derived, then confirmed",
                "mode": "mock",
                "use_for_ai": True,
            },
            "mem-spanish-practice": {
                "id": "mem-spanish-practice",
                "title": "Spanish practice",
                "content": "Conversational confidence is more important than test performance.",
                "source": "Goal description",
                "mode": "mock",
                "use_for_ai": False,
            },
        }

    async def store(self, *, title: str, content: str, source: str | None = None) -> dict:
        item = {
            "id": f"mem-{uuid4()}",
            "title": title,
            "content": content,
            "source": source,
            "mode": "mock",
            "use_for_ai": True,
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

    async def update(self, memory_id: str, **fields: object) -> dict | None:
        item = self._items.get(memory_id)
        if not item:
            return None
        allowed = {"title", "content", "source", "use_for_ai", "useForAi"}
        for key, value in fields.items():
            if key not in allowed or value is None:
                continue
            if key == "useForAi":
                item["use_for_ai"] = bool(value)
            else:
                item[key] = value
        return dict(item)

    async def delete(self, memory_id: str) -> bool:
        return self._items.pop(memory_id, None) is not None


mock_memory_store = MockMemoryStore()
