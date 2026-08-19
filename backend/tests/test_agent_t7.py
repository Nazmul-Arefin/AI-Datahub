"""T7: ContextBuilder + AgentService run persists; fallback when Harness is down."""

from __future__ import annotations

import json

import pytest

from app.adapters.agent_harness.client import HarnessClient
from app.adapters.agent_harness.fallback import FallbackLoopAdapter
from app.adapters.agent_harness.store import AgentRunStore
from app.adapters.llm_deepseek.client import DeepSeekClient
from app.adapters.mcp_gateway.client import McpGatewayClient
from app.services.agent_service import AgentService
from app.services.context_builder import ContextBuilder
from app.services.llm_service import LLMService
from app.services.mcp_service import McpService
from app.services.memory_service import MemoryService


class _Mem:
    def __init__(self) -> None:
        self.items: list[dict] = []

    async def store(self, *, title: str, content: str, source: str | None = None) -> dict:
        item = {"id": f"mem-{len(self.items)+1}", "title": title, "content": content, "source": source}
        self.items.append(item)
        return item

    async def search(self, query: str) -> list[dict]:
        hits = [item for item in self.items if query.lower() in json.dumps(item).lower()]
        return hits or list(self.items)


@pytest.mark.asyncio
async def test_run_includes_memory_and_tools_and_persists(tmp_path):
    memory = MemoryService(store=_Mem())
    await memory.store(title="Morning focus", content="Deep work 08:30-10:00", source="calendar")
    mcp = McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl"))
    await mcp.register(connection_id="conn-t7", name="github")
    store = AgentRunStore(path=tmp_path / "agent_runs.jsonl")
    service = AgentService(
        client=HarnessClient(mode="mock"),
        mcp=mcp,
        memory=memory,
        builder=ContextBuilder(),
        store=store,
    )
    result = await service.run("Plan the morning", goal_id="goal-1")
    assert result["runId"]
    assert result["status"] == "queued"
    assert result.get("sessionId")
    assert result["mode"] == "mock"
    assert "list_repos" in result["context"]["allowedTools"]
    titles = [item.get("title") for item in result["context"]["memories"]]
    assert "Morning focus" in titles
    assert "accessToken" not in json.dumps(result)

    loaded = store.get(result["runId"])
    assert loaded is not None
    assert loaded["goalId"] == "goal-1"
    assert (tmp_path / "agent_runs.jsonl").exists()

    reloaded = AgentRunStore(path=tmp_path / "agent_runs.jsonl")
    assert reloaded.get(result["runId"]) is not None
    assert reloaded.get(result["runId"])["goalId"] == "goal-1"

    fetched = await service.get_run(result["runId"])
    assert fetched["runId"] == result["runId"]
    assert fetched["sessionId"] == result["sessionId"]


@pytest.mark.asyncio
async def test_fallback_when_harness_raises(tmp_path):
    class Boom:
        mode = "live"

        async def start_run(self, mission: str, goal_id: str | None = None, context: dict | None = None) -> dict:
            raise ConnectionError("harness down")

        async def get_run(self, run_id: str, session_id: str | None = None) -> dict:
            raise ConnectionError("harness down")

    service = AgentService(
        client=Boom(),
        mcp=McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl")),
        memory=MemoryService(store=_Mem()),
        builder=ContextBuilder(),
        fallback=FallbackLoopAdapter(llm=LLMService(client=DeepSeekClient(api_key=""))),
        store=AgentRunStore(path=tmp_path / "agent_runs.jsonl"),
    )
    result = await service.run("Summarize the week")
    assert result["mode"] == "fallback"
    assert result["status"] == "completed"
    assert result["events"]
    assert result["events"][-1]["type"] == "assistant/message"


@pytest.mark.asyncio
async def test_agents_runs_http_returns_session(client):
    started = await client.post("/api/v1/agents/runs", json={"mission": "Plan the week", "goalId": "goal-1"})
    assert started.status_code == 200
    body = started.json()
    assert body["runId"]
    assert body["status"] in {"queued", "running", "completed"}
    assert body.get("sessionId")
    assert "accessToken" not in json.dumps(body)

    fetched = await client.get(f"/api/v1/agents/runs/{body['runId']}")
    assert fetched.status_code == 200
    assert fetched.json()["runId"] == body["runId"]
    assert isinstance(fetched.json().get("events"), list)


@pytest.mark.asyncio
async def test_unknown_run_id_is_not_found(tmp_path, client):
    service = AgentService(
        client=HarnessClient(mode="mock"),
        mcp=McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl")),
        memory=MemoryService(store=_Mem()),
        builder=ContextBuilder(),
        store=AgentRunStore(path=tmp_path / "agent_runs.jsonl"),
    )
    assert await service.get_run("missing-run") is None

    response = await client.get("/api/v1/agents/runs/missing-run")
    assert response.status_code == 404
    payload = response.json()
    message = payload.get("error", {}).get("message") or payload.get("detail")
    assert message == "Agent run not found"
