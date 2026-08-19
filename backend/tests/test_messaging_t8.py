"""T8: AstrBot Telegram connect registers MCP/source; high-impact tools need confirm."""

from __future__ import annotations

import json

import pytest

from app.adapters.astrbot.client import AstrBotClient
from app.adapters.mcp_gateway.client import McpGatewayClient
from app.services.mcp_service import McpService
from app.services.messaging_service import MessagingService


def _no_secrets(payload: object) -> None:
    blob = json.dumps(payload)
    for key in ("accessToken", "telegram_token", "botToken"):
        assert f'"{key}"' not in blob


@pytest.mark.asyncio
async def test_telegram_connect_registers_source_and_mcp(tmp_path):
    mcp = McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl"))
    service = MessagingService(client=AstrBotClient(mode="mock"), mcp=mcp)
    listed = await service.list_platforms()
    ids = {item["id"] for item in listed["platforms"]}
    assert "telegram" in ids
    assert listed["role"] == "messaging"

    connected = await service.connect("telegram")
    assert connected["status"] == "connected"
    assert connected["platform"] == "telegram"
    assert connected["card"]["title"] == "Telegram connected (mock)"
    assert connected["sourceId"]
    assert connected["mcpServerId"]
    _no_secrets(connected)

    sources = await service.list_sources()
    assert any(item["id"] == connected["sourceId"] for item in sources["sources"])

    tools = await mcp.list_tools(connected["mcpServerId"])
    names = {item["name"] for item in tools["tools"]}
    assert {"list_chats", "send_message"} <= names
    send = next(item for item in tools["tools"] if item["name"] == "send_message")
    assert send["confirmationRequired"] is True

    blocked = await mcp.invoke("send_message", {"text": "hi"}, server_id=connected["mcpServerId"])
    assert blocked["ok"] is False
    assert blocked["error"]["code"] == "confirmation_required"

    sent = await mcp.invoke(
        "send_message",
        {"text": "hi", "confirm": True},
        server_id=connected["mcpServerId"],
    )
    assert sent["ok"] is True
    _no_secrets(sent)


@pytest.mark.asyncio
async def test_telegram_connect_http_card(client):
    listed = await client.get("/api/v1/messaging/platforms")
    assert listed.status_code == 200
    assert listed.json()["role"] == "messaging"

    connected = await client.post("/api/v1/messaging/telegram/connect")
    assert connected.status_code == 200
    body = connected.json()
    assert body["card"]["title"] == "Telegram connected (mock)"
    assert body["mcpServerId"]
    assert "telegram_token" not in json.dumps(body)

    sources = await client.get("/api/v1/messaging/sources")
    assert sources.status_code == 200
    assert sources.json()["sources"]


@pytest.mark.asyncio
async def test_messaging_send_echoes_without_bot_token(client):
    sent = await client.post("/api/v1/messaging/messages", json={"content": "hello", "threadId": "123"})
    assert sent.status_code == 200
    assert "Received: hello" in sent.json()["message"]["content"]
    assert "telegram_token" not in json.dumps(sent.json())


@pytest.mark.asyncio
async def test_messaging_send_uses_live_client_when_present(tmp_path):
    class _LiveSend:
        telegram_bot_token = "x"

        async def send_telegram(self, content: str, chat_id: str):
            return {
                "threadId": chat_id,
                "message": {"id": "tg-1", "role": "assistant", "content": content, "createdAt": "now"},
                "mode": "live",
            }

    mcp = McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "audit.jsonl"))
    service = MessagingService(client=_LiveSend(), mcp=mcp)
    result = await service.send("hi there", "chat-99")
    assert result["mode"] == "live"
    assert result["threadId"] == "chat-99"
    assert result["message"]["content"] == "hi there"
