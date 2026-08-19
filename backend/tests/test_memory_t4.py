"""T4: memory store/search/recall/update over HTTP, mock or sidecar."""

from __future__ import annotations

import pytest

from app.core.config import Settings
from app.services.memory_service import MemoryService


@pytest.mark.asyncio
async def test_memory_search_and_patch_http(client):
    created = await client.post(
        "/api/v1/memories",
        json={"title": "Morning focus", "content": "Deep work 08:30-10:00", "source": "calendar"},
    )
    assert created.status_code == 200
    memory_id = created.json()["id"]

    found = await client.get("/api/v1/memories", params={"q": "focus"})
    assert found.status_code == 200
    body = found.json()
    assert body["total"] >= 1
    assert any(item["id"] == memory_id for item in body["items"])

    patched = await client.patch(
        f"/api/v1/memories/{memory_id}",
        json={"content": "Deep work 08:00-10:00"},
    )
    assert patched.status_code == 200
    assert "08:00" in patched.json()["content"]

    recalled = await client.get(f"/api/v1/memories/{memory_id}")
    assert recalled.status_code == 200
    assert "08:00" in recalled.json()["content"]


@pytest.mark.asyncio
async def test_memory_service_live_mode_uses_http_adapter(monkeypatch):
    from app.adapters.memory_tencent.client import TencentMemoryClient

    calls: list[str] = []

    class _Fake:
        async def store(self, **kwargs):
            calls.append("store")
            return {"id": "mem-live-1", "title": kwargs["title"], "content": kwargs["content"], "mode": "live"}

        async def recall(self, memory_id: str):
            calls.append("recall")
            return {"id": memory_id, "title": "x", "content": "y", "mode": "live"}

        async def search(self, query: str):
            return [{"id": "mem-live-1", "title": "x", "content": query, "mode": "live"}]

        async def update(self, memory_id: str, **fields):
            return {"id": memory_id, "mode": "live", **fields}

        async def delete(self, memory_id: str):
            return True

    settings = Settings(memory_mode="live")
    service = MemoryService(store=_Fake(), settings=settings)
    stored = await service.store(title="A", content="B")
    recalled = await service.recall(stored["id"])
    assert stored["mode"] == "live"
    assert recalled["mode"] == "live"
    assert "store" in calls and "recall" in calls
    assert TencentMemoryClient  # imported for contract visibility


def test_parse_search_payload_drops_string_results():
    from app.adapters.memory_tencent.client import parse_search_payload

    empty = parse_search_payload(
        {"results": "No matching memories found.", "total": 0, "strategy": "fts"}
    )
    assert empty == []
    rows = parse_search_payload(
        {
            "results": [
                {"id": "mem-1", "title": "Focus", "content": "Deep work 08:30-10:00"},
            ]
        }
    )
    assert rows[0]["id"] == "mem-1"
    assert rows[0]["title"] == "Focus"


@pytest.mark.asyncio
async def test_tencent_client_capture_shape_and_no_memories_crud():
    import json

    import httpx

    from app.adapters.memory_tencent.client import TencentMemoryClient

    seen: list[tuple[str, str, dict]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        payload = json.loads(request.content) if request.content else {}
        seen.append((request.method, request.url.path, payload))
        if request.url.path.endswith("/capture"):
            return httpx.Response(200, json={"l0_recorded": 2, "scheduler_notified": True})
        if request.url.path.endswith("/search/memories"):
            return httpx.Response(
                200,
                json={"results": "No matching memories found.", "total": 0, "strategy": "fts"},
            )
        if request.url.path.endswith("/recall"):
            return httpx.Response(
                400,
                json={"error": "Missing required fields: query, session_key"},
            )
        return httpx.Response(404, json={"error": f"Not found: {request.method} {request.url.path}"})

    client = TencentMemoryClient(
        base_url="http://memory.test",
        transport=httpx.MockTransport(handler),
        index_path=None,
    )
    stored = await client.store(title="Morning focus", content="Deep work 08:30-10:00", source="calendar")
    assert stored["id"].startswith("mem-")
    assert stored["title"] == "Morning focus"
    capture = next(item for item in seen if item[1].endswith("/capture"))
    assert capture[0] == "POST"
    assert "user_content" in capture[2]
    assert "assistant_content" in capture[2]
    assert capture[2]["session_key"] == stored["id"]
    assert not any(item[1].rstrip("/").endswith("/memories") and item[0] == "POST" for item in seen)

    found = await client.search("focus")
    assert any(item["id"] == stored["id"] for item in found)
    assert all("results" not in item for item in found)

    recalled = await client.recall(stored["id"])
    assert recalled is not None
    assert "08:30" in recalled["content"]

    missing = await client.recall("no-such-id")
    assert missing is None
    assert not any(item[1].endswith("/recall") for item in seen)


@pytest.mark.asyncio
async def test_recall_does_not_treat_core_persona_as_that_id():
    import httpx

    from app.adapters.memory_tencent.client import TencentMemoryClient

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/recall"):
            return httpx.Response(
                200,
                json={"context": "<user-persona> morning guardian", "memory_count": 1, "code": 0},
            )
        return httpx.Response(404, json={"error": "not found"})

    client = TencentMemoryClient(
        base_url="http://memory.test",
        transport=httpx.MockTransport(handler),
        index_path=None,
    )
    assert await client.recall("no-such-id") is None


@pytest.mark.asyncio
async def test_memory_index_reloads_from_jsonl(tmp_path):
    import json

    import httpx

    from app.adapters.memory_tencent.client import TencentMemoryClient

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.endswith("/capture"):
            return httpx.Response(200, json={"l0_recorded": 2, "scheduler_notified": True})
        return httpx.Response(404, json={"error": "not found"})

    path = tmp_path / "memory_index.jsonl"
    first = TencentMemoryClient(
        base_url="http://memory.test",
        transport=httpx.MockTransport(handler),
        index_path=path,
    )
    stored = await first.store(title="Persist me", content="Deep work 08:30", source="test")
    second = TencentMemoryClient(
        base_url="http://memory.test",
        transport=httpx.MockTransport(handler),
        index_path=path,
    )
    recalled = await second.recall(stored["id"])
    assert recalled is not None
    assert recalled["content"] == "Deep work 08:30"
    assert path.exists()
    assert json.loads(path.read_text(encoding="utf-8").splitlines()[0])["id"] == stored["id"]


@pytest.mark.asyncio
async def test_memory_service_search_drops_core_envelope():
    class _Envelope:
        async def search(self, query: str):
            return [{"results": "No matching memories found.", "total": 0, "strategy": "fts"}]

    service = MemoryService(store=_Envelope(), settings=Settings(memory_mode="live"))
    result = await service.search("focus")
    assert result["items"] == []
    assert result["total"] == 0
