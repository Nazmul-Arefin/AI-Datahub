"""Messaging / IM — API → MessagingService → AstrBot. Never a Goals/Use agent loop."""

from uuid import uuid4

from app.adapters.astrbot import astrbot_client
from app.adapters.astrbot.client import MESSAGING_TOOLS, PLATFORM_SPECS
from app.adapters.mcp_gateway.registry import strip_secrets
from app.core.config import Settings, get_settings, settings
from app.schemas.sources import ConnectStartResponse


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
        status = result.get("status", "connected")
        if status == "setup_required":
            return strip_secrets(result)
        if status == "unsupported":
            return strip_secrets(result)

        source_id = f"src-{platform}-{uuid4().hex[:8]}"
        tools = list(MESSAGING_TOOLS)
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
            "status": status,
            "mcpServerId": registered.get("serverId"),
            "credentialRef": result.get("credentialRef"),
            "mode": result.get("mode", "mock"),
        }
        self._sources[source_id] = source
        mode = result.get("mode", "mock")
        title = f"{platform} connected ({mode})"
        spec = PLATFORM_SPECS.get(platform.lower().replace("_", "-"))
        if spec:
            title = f"{spec['name']} connected ({mode})"
        payload = {
            **result,
            "sourceId": source_id,
            "mcpServerId": registered.get("serverId"),
            "card": {
                "title": title,
                "platform": platform,
                "status": status,
                "sourceId": source_id,
                "mcpServerId": registered.get("serverId"),
            },
        }
        return strip_secrets(payload)

    async def list_sources(self) -> dict:
        return {"sources": [strip_secrets(dict(item)) for item in self._sources.values()]}

    async def send(self, content: str, thread_id: str | None = None, platform: str | None = None) -> dict:
        key = (platform or "").lower().replace("_", "-")
        if key in {"feishu", "lark"} and thread_id:
            from app.adapters.feishu.client import feishu_client

            creds = await feishu_client.resolve_credentials(self._client)
            if not creds:
                raise RuntimeError("Feishu credentials unavailable — enable lark adapter or set FEISHU_APP_*")
            sent = await feishu_client.send_text(creds, thread_id, content)
            return {
                "threadId": thread_id,
                "message": {
                    "id": str(sent.get("message_id") or f"fs-{uuid4().hex[:8]}"),
                    "role": "assistant",
                    "content": content[:120],
                    "createdAt": "now",
                },
                "mode": "live",
                "platform": "feishu",
            }

        send_live = getattr(self._client, "send_telegram", None)
        if callable(send_live) and thread_id and key in {"", "telegram"}:
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

    async def connect_platform(
        self,
        platform: str,
        redirect_uri: str | None,
        user_id: str,
        state: str,
    ) -> ConnectStartResponse:
        result = await self.connect(platform)
        if result.get("status") == "setup_required":
            setup_url = result.get("setupUrl") or f"{settings.astrbot_public_url.rstrip('/')}/#/platforms"
            return ConnectStartResponse(
                authorizationUrl=setup_url,
                state=state,
                setupRequired=True,
                setupUrl=setup_url,
                hint=result.get("hint"),
                mode=result.get("mode"),
                platform=platform,
            )
        if result.get("status") == "unsupported":
            return ConnectStartResponse(
                authorizationUrl=redirect_uri or "/",
                state=state,
                setupRequired=True,
                setupUrl=f"{settings.astrbot_public_url.rstrip('/')}/#/platforms",
                hint=f"{platform} is not supported by this AstrBot build yet.",
                mode=result.get("mode"),
                platform=platform,
            )
        callback = (
            f"{settings.api_public_url.rstrip('/')}/integrations/callback"
            f"?code=astrbot-ok&state={state}"
        )
        return ConnectStartResponse(
            authorizationUrl=callback,
            state=state,
            setupRequired=False,
            mode=result.get("mode"),
            platform=platform,
        )


messaging_service = MessagingService()
