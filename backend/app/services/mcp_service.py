"""MCP catalog / registry / invoke — agents never see secrets."""

from app.adapters.mcp_gateway.client import mcp_gateway_client
from app.adapters.mcp_gateway.registry import strip_secrets
from app.core.config import Settings, get_settings


class McpService:
    def __init__(self, client=mcp_gateway_client, settings: Settings | None = None) -> None:
        self._client = client
        self._settings = settings or get_settings()

    async def list_catalog(self) -> dict:
        servers = await self._client.list_servers()
        return strip_secrets({"servers": servers, "mode": self._settings.mcp_gateway_mode})

    async def register(
        self,
        *,
        connection_id: str,
        name: str,
        tools: list[dict] | None = None,
        credential_ref: str | None = None,
    ) -> dict:
        return strip_secrets(
            await self._client.register(
                connection_id=connection_id,
                name=name,
                tools=tools,
                credential_ref=credential_ref,
            )
        )

    async def list_tools(self, server_id: str) -> dict:
        tools = await self._client.list_tools(server_id)
        return strip_secrets(
            {"serverId": server_id, "tools": tools, "mode": self._settings.mcp_gateway_mode}
        )

    async def invoke(self, tool: str, args: dict | None = None, server_id: str | None = None) -> dict:
        return strip_secrets(await self._client.invoke(tool, args, server_id=server_id))

    async def list_audit(self) -> dict:
        events = await self._client.list_audit()
        mode = getattr(self._client, "mode", None) or self._settings.mcp_gateway_mode
        sink = "sidecar" if mode == "live" else "local_file"
        return {"events": strip_secrets(events), "total": len(events), "sink": sink}

    async def list_connectors(self) -> list[dict[str, str]]:
        catalog = await self.list_catalog()
        return [
            {"id": item.get("name", item.get("serverId", "")), "name": item.get("name", ""), "status": "available"}
            for item in catalog["servers"]
        ]


mcp_service = McpService()
