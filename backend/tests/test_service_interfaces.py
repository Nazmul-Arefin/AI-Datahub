"""T2: mock service facades return contract-shaped data with no live network."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.services.agent_service import AgentService
from app.services.auth_connector import AuthConnector
from app.services.context_builder import ContextBuilder
from app.services.mcp_service import McpService
from app.services.memory_service import MemoryService
from app.services.messaging_service import MessagingService

TOKEN_KEYS = {"accessToken", "access_token", "refreshToken", "refresh_token", "token"}


def _assert_no_secrets(payload: object) -> None:
    if isinstance(payload, dict):
        assert TOKEN_KEYS.isdisjoint(payload.keys())
        for value in payload.values():
            _assert_no_secrets(value)
    elif isinstance(payload, list):
        for item in payload:
            _assert_no_secrets(item)


@pytest.mark.asyncio
async def test_agent_service_run_returns_queued_run():
    result = await AgentService().run(mission="Plan the week", goal_id="goal-1")
    assert result["status"] == "queued"
    assert result["runId"]
    assert result.get("mode") == "mock"
    _assert_no_secrets(result)


@pytest.mark.asyncio
async def test_messaging_service_lists_platforms_and_connects():
    service = MessagingService()
    listed = await service.list_platforms()
    ids = {item["id"] for item in listed["platforms"]}
    assert {"telegram", "discord", "feishu", "dingtalk", "wecom", "qq"} <= ids

    connected = await service.connect("telegram")
    assert connected["status"] == "connected"
    assert connected["platform"] == "telegram"
    assert connected["credentialRef"].startswith("cred_")
    assert connected.get("mode") == "mock"
    _assert_no_secrets(connected)

    feishu = await service.connect("feishu")
    assert feishu["status"] == "connected"
    assert feishu["platform"] == "feishu"
    _assert_no_secrets(feishu)


@pytest.mark.asyncio
async def test_auth_connector_authorize_callback_refresh_has_no_tokens():
    from app.adapters.nango.client import NangoClient

    connector = AuthConnector(client=NangoClient(mode="mock", secret_key=""))
    start = await connector.authorize("github", redirect_uri="http://localhost/cb")
    assert "authorizationUrl" in start
    assert start["state"]
    assert "github" in start["authorizationUrl"]
    _assert_no_secrets(start)

    done = await connector.callback(code="mock-code", state=start["state"])
    assert done["status"] == "connected"
    assert done["credentialRef"]
    _assert_no_secrets(done)

    refreshed = await connector.refresh(done["credentialRef"])
    assert refreshed["status"] == "ok"
    assert refreshed["credentialRef"] == done["credentialRef"]
    _assert_no_secrets(refreshed)


@pytest.mark.asyncio
async def test_mcp_service_register_list_tools_and_invoke():
    service = McpService()
    catalog = await service.list_catalog()
    assert catalog["servers"]

    registered = await service.register(
        connection_id="conn-1",
        name="github-mock",
        tools=[{"name": "list_repos", "description": "List repos"}],
    )
    assert registered["serverId"]

    tools = await service.list_tools(registered["serverId"])
    names = {tool["name"] for tool in tools["tools"]}
    assert "list_repos" in names

    invoked = await service.invoke("list_repos", {"org": "acme"})
    assert invoked["ok"] is True
    assert invoked["tool"] == "list_repos"
    _assert_no_secrets(invoked)


@pytest.mark.asyncio
async def test_memory_service_store_search_recall_update_delete():
    service = MemoryService()
    stored = await service.store(
        title="Morning focus",
        content="Deep work 08:30-10:00",
        source="calendar",
    )
    memory_id = stored["id"]
    assert stored["title"] == "Morning focus"

    recalled = await service.recall(memory_id)
    assert recalled["id"] == memory_id
    assert "08:30" in recalled["content"]

    hits = await service.search("focus")
    assert hits["total"] >= 1
    assert any(item["id"] == memory_id for item in hits["items"])

    updated = await service.update(memory_id, content="Deep work 08:00-10:00")
    assert "08:00" in updated["content"]

    deleted = await service.delete(memory_id)
    assert deleted["deleted"] is True
    assert await service.recall(memory_id) is None


@pytest.mark.asyncio
async def test_llm_service_chat_and_stream_are_mock():
    from app.adapters.llm_deepseek.client import DeepSeekClient
    from app.services.llm_service import LLMService

    service = LLMService(client=DeepSeekClient(api_key=""))
    chat = await service.chat([{"role": "user", "content": "Hello"}])
    assert chat["role"] == "assistant"
    assert chat["content"]
    assert chat.get("mode") == "mock"

    chunks = [chunk async for chunk in service.stream([{"role": "user", "content": "Hi"}])]
    assert chunks
    assert chunks[-1]["done"] is True


def test_context_builder_includes_tools_and_memory_slots():
    built = ContextBuilder().build(
        goal_id="goal-1",
        source_ids=["src-1"],
        allowed_tools=["list_repos"],
    )
    assert built["goalId"] == "goal-1"
    assert built["sourceIds"] == ["src-1"]
    assert built["allowedTools"] == ["list_repos"]
    assert "memories" in built
    assert built.get("mode") == "mock"


@pytest.mark.asyncio
async def test_knowledge_service_search_is_stub():
    from app.services.knowledge_service import KnowledgeService

    result = await KnowledgeService().search("anything")
    assert result["hits"] == []
    assert result.get("mode") == "stub"


def test_api_modules_do_not_import_sidecar_adapters():
    api_dir = Path(__file__).resolve().parents[1] / "app" / "api"
    for path in api_dir.glob("*.py"):
        source = path.read_text(encoding="utf-8")
        assert "app.adapters" not in source, path.name
