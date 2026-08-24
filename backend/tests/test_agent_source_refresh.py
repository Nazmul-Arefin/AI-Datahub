from app.adapters.agent_harness.client import HarnessClient
from app.adapters.agent_harness.store import AgentRunStore
from app.adapters.mcp_gateway.client import McpGatewayClient
from app.services.agent_service import AgentService, infer_sources_for_mission
from app.services.context_builder import ContextBuilder
from app.services.mcp_service import McpService
from app.services.memory_service import MemoryService

import pytest


def test_infer_sources_picks_mentioned_mcp():
    authorized = [("gmail", "Gmail"), ("calendar", "Google Calendar"), ("notion", "Notion Workspace")]
    picked = infer_sources_for_mission("Summarize my gmail inbox for today", authorized)
    assert picked == [("gmail", "Gmail")]


def test_infer_sources_falls_back_to_all_authorized():
    authorized = [("gmail", "Gmail"), ("calendar", "Google Calendar")]
    picked = infer_sources_for_mission("What should I do next?", authorized)
    assert picked == authorized


def test_context_prompt_marks_live_refresh():
    prompt = ContextBuilder().format_prompt(
        "Summarize Gmail",
        {
            "refreshedSourceIds": ["gmail"],
            "snippets": [
                {
                    "sourceId": "gmail",
                    "title": "Hello",
                    "content": "Today's note",
                    "syncedAt": "2026-08-24T11:00:00+00:00",
                    "lastEditedAt": "Mon, 24 Aug 2026 05:14:38 +0000",
                }
            ],
        },
    )
    assert "live-synced just now" in prompt
    assert "gmail @ 2026-08-24T11:00:00+00:00" in prompt
    assert "dated Mon, 24 Aug 2026 05:14:38 +0000" in prompt
    assert "not stale" in prompt


class _Mem:
    async def search(self, query: str) -> dict:
        return {"items": []}


class _FakeDb:
    def commit(self) -> None:
        return None

    def rollback(self) -> None:
        return None

    def close(self) -> None:
        return None


@pytest.mark.asyncio
async def test_refresh_calls_sync_only_for_inferred_source(monkeypatch, tmp_path):
    from app.services import agent_service as agent_mod
    from app.services.sync_service import sync_service

    monkeypatch.setattr(agent_mod, "_provider_refresh_enabled", lambda: True)
    monkeypatch.setattr("app.core.database.SessionLocal", lambda: _FakeDb())

    called: list[str] = []

    async def fake_sync(source_id: str, db=None):
        called.append(source_id)
        return {"sourceId": source_id}

    monkeypatch.setattr(sync_service, "sync_source", fake_sync)

    service = AgentService(
        client=HarnessClient(mode="live"),
        mcp=McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl")),
        memory=MemoryService(store=_Mem()),
        builder=ContextBuilder(),
        store=AgentRunStore(path=tmp_path / "agent_runs.jsonl"),
    )
    service._authorized_live_sources = lambda: [("gmail", "Gmail"), ("notion", "Notion Workspace")]
    refreshed = await service._refresh_sources_for_mission("Summarize my Gmail inbox for today")
    assert called == ["gmail"]
    assert refreshed == ["gmail"]


@pytest.mark.asyncio
async def test_refresh_skipped_when_providers_are_mock(monkeypatch, tmp_path):
    from app.services import agent_service as agent_mod

    monkeypatch.setattr(agent_mod, "_provider_refresh_enabled", lambda: False)
    service = AgentService(
        client=HarnessClient(mode="mock"),
        mcp=McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl")),
        memory=MemoryService(store=_Mem()),
        builder=ContextBuilder(),
        store=AgentRunStore(path=tmp_path / "agent_runs.jsonl"),
    )
    assert await service._refresh_sources_for_mission("Summarize my Gmail inbox") == []
