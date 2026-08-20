"""MCP catalog / registry / invoke — agents never see secrets."""

import logging

from app.adapters.mcp_gateway.client import mcp_gateway_client
from app.adapters.mcp_gateway.registry import strip_secrets
from app.core.config import Settings, get_settings

logger = logging.getLogger(__name__)


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

    async def list_tools(self, server_id: str | None = None) -> dict | list[dict]:
        if not server_id:
            return []
        tools = await self._client.list_tools(server_id)
        return strip_secrets(
            {"serverId": server_id, "tools": tools, "mode": self._settings.mcp_gateway_mode}
        )

    async def invoke(self, tool: str, args: dict | None = None, server_id: str | None = None) -> dict:
        result = strip_secrets(await self._client.invoke(tool, args, server_id=server_id))
        from app.services.activity_service import activity_service

        ok = result.get("ok", True)
        activity_service.record(
            "MCP tool invoked" if ok else "MCP invoke failed",
            f"{tool}" + (f" on {server_id}" if server_id else ""),
            route="use-data",
        )
        return result

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

    async def register_connection(self, connection_id: str) -> None:
        await self.register(connection_id=connection_id, name=connection_id)

    async def unregister(self, connection_id: str) -> None:
        unregister = getattr(self._client, "unregister", None)
        if callable(unregister):
            await unregister(connection_id)
            return
        logger.info("MCP unregister for connection %s (gateway has no unregister)", connection_id)


mcp_service = McpService()
