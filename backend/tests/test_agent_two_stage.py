from __future__ import annotations

import asyncio

import pytest

from app.adapters.agent_harness.client import HarnessClient
from app.adapters.agent_harness.store import AgentRunStore
from app.adapters.mcp_gateway.client import McpGatewayClient
from app.services.agent_service import AgentService
from app.services.context_builder import ContextBuilder
from app.services.mcp_service import McpService
from app.services.memory_service import MemoryService


class _Mem:
    async def search(self, query: str) -> dict:
        return {"items": []}


def _service(tmp_path, client):
    return AgentService(
        client=client,
        mcp=McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl")),
        memory=MemoryService(store=_Mem()),
        builder=ContextBuilder(),
        store=AgentRunStore(path=tmp_path / "agent_runs.jsonl"),
    )


@pytest.mark.asyncio
async def test_mock_run_plans_then_answers(tmp_path):
    service = _service(tmp_path, HarnessClient(mode="mock"))
    result = await service.run("Summarize my inbox")
    assert result["status"] == "completed"
    assert result["stage"] == "completed"
    assert result["workPlan"]
    assert result["guidelinePlan"]
    assert result["sourcesUsed"]
    assert result.get("planningSessionId")
    assert result.get("executionSessionId")
    summary = result.get("summary") or ""
    assert "Mock result" in summary
    assert "```weeple-plan" not in summary


def test_execute_prompt_follows_plan_and_skips_new_json():
    prompt = ContextBuilder().format_execute_prompt(
        "Summarize Gmail",
        {"sourceIds": ["gmail"]},
        plans={
            "workPlan": [{"title": "Read inbox", "detail": "Use live Gmail"}],
            "guidelinePlan": [{"title": "No invention", "detail": "Facts only"}],
            "sourcesUsed": ["gmail"],
        },
    )
    assert "Execution Agent" in prompt
    assert "Read inbox" in prompt
    assert "No invention" in prompt
    assert "```weeple-plan" not in prompt.lower()
    assert "Return ONLY one fenced" not in prompt


@pytest.mark.asyncio
async def test_live_returns_plan_before_main_agent_finishes(tmp_path):
    class Staged:
        mode = "live"

        def __init__(self) -> None:
            self.roles: list[str | None] = []

        async def start_run(self, mission, goal_id=None, context=None, role=None):
            self.roles.append(role)
            if role == "planning":
                return {
                    "runId": "sess-plan",
                    "sessionId": "sess-plan",
                    "status": "completed",
                    "mode": "live",
                    "summary": (
                        "```weeple-plan\n"
                        '{"headline":"Inbox","workPlan":[{"title":"Read Gmail","detail":"live"}],'
                        '"guidelinePlan":[{"title":"No invention","detail":"facts only"}],'
                        '"sourcesUsed":["gmail"]}\n'
                        "```"
                    ),
                    "events": [],
                }
            await asyncio.sleep(0.2)
            return {
                "runId": "sess-exec",
                "sessionId": "sess-exec",
                "status": "completed",
                "mode": "live",
                "summary": "# Inbox\n\n3 unread messages.",
                "events": [{"type": "assistant/message", "text": "# Inbox\n\n3 unread messages."}],
            }

        async def get_run(self, run_id: str, session_id: str | None = None):
            return None

    client = Staged()
    service = _service(tmp_path, client)
    result = await service.run("Summarize Gmail")
    assert result["status"] == "executing"
    assert result["stage"] == "executing"
    assert result["workPlan"][0]["title"] == "Read Gmail"
    assert result["guidelinePlan"][0]["title"] == "No invention"
    assert result["sourcesUsed"] == ["gmail"]
    assert not result.get("summary")
    assert client.roles == ["planning"]

    fetched = None
    for _ in range(40):
        fetched = await service.get_run(result["runId"])
        if fetched and fetched.get("status") == "completed":
            break
        await asyncio.sleep(0.05)
    assert fetched is not None
    assert fetched["status"] == "completed"
    assert "unread" in (fetched.get("summary") or "")
    assert client.roles == ["planning", "execution"]
