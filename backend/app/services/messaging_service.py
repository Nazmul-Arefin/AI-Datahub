"""Messaging / IM — API → MessagingService → AstrBot. Never a Goals/Use agent loop."""

from uuid import uuid4

from app.adapters.astrbot import astrbot_client
from app.adapters.astrbot.client import TELEGRAM_TOOLS
from app.adapters.mcp_gateway.registry import strip_secrets
from app.core.config import Settings, get_settings


class MessagingService:
    def __init__(self, client=astrbot_client, mcp=None, settings: Settings | None = None) -> None:
        self._client = client
        self._mcp = mcp
        self._settings = settings or get_settings()
        self._sources: dict[str, dict] = {}

    def _mcp_service(self):
        if self._mcp is not None:
            return self._mcp
        from app.services.mcp_service import mcp_service

        return mcp_service

    async def list_platforms(self) -> dict:
        platforms = await self._client.list_platforms()
        connected = {item["platform"] for item in self._sources.values()}
        listed = []
        for item in platforms:
            row = dict(item)
            if row.get("id") in connected:
                row["status"] = "connected"
            listed.append(row)
        sidecar = False
        if getattr(self._client, "mode", None) == "live":
            ping = getattr(self._client, "ping", None)
            if callable(ping):
                sidecar = await ping()
        return {
            "platforms": listed,
            "mode": self._settings.astrbot_mode if sidecar or self._settings.astrbot_mode == "mock" else "mock",
            "webUi": getattr(self._client, "public_url", None) or getattr(self._client, "base_url", None),
            "role": "messaging",
        }

    async def connect(self, platform: str) -> dict:
        result = strip_secrets(await self._client.connect(platform))
        source_id = f"src-{platform}-{uuid4().hex[:8]}"
        tools = list(TELEGRAM_TOOLS) if platform.lower() == "telegram" else None
        registered = await self._mcp_service().register(
            connection_id=result.get("credentialRef") or source_id,
            name=f"astrbot-{platform}",
            tools=tools,
            credential_ref=result.get("credentialRef"),
        )
        source = {
            "id": source_id,
            "platform": platform,
            "kind": "messaging",
            "status": result.get("status", "connected"),
            "mcpServerId": registered.get("serverId"),
            "credentialRef": result.get("credentialRef"),
            "mode": result.get("mode", "mock"),
        }
        self._sources[source_id] = source
        mode = result.get("mode", "mock")
        card_title = "Telegram connected (mock)" if platform.lower() == "telegram" else f"{platform} connected ({mode})"
        if platform.lower() == "telegram" and mode == "live":
            card_title = "Telegram connected (live)"
        payload = {
            **result,
            "sourceId": source_id,
            "mcpServerId": registered.get("serverId"),
            "card": {
                "title": card_title,
                "platform": platform,
                "status": result.get("status", "connected"),
                "sourceId": source_id,
                "mcpServerId": registered.get("serverId"),
            },
        }
        return strip_secrets(payload)

    async def list_sources(self) -> dict:
        return {"sources": [strip_secrets(dict(item)) for item in self._sources.values()]}

    async def send(self, content: str, thread_id: str | None = None) -> dict:
        send_live = getattr(self._client, "send_telegram", None)
        if callable(send_live) and thread_id:
            live = await send_live(content, thread_id)
            if live:
                return strip_secrets(live)
        tid = thread_id or "thread-stub-1"
        return {
            "threadId": tid,
            "message": {
                "id": f"msg-{uuid4().hex[:8]}",
                "role": "assistant",
                "content": f"Received: {content[:120]}",
                "createdAt": "now",
            },
            "mode": "mock",
        }


messaging_service = MessagingService()
