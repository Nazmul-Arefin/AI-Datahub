"""MCP connector catalog and tool routing.

Dev1 calls register/unregister after connect/revoke. Dev2 implements the gateway.
"""

import logging

logger = logging.getLogger(__name__)


class McpService:
    async def list_connectors(self) -> list[dict[str, str]]:
        return [{"id": "notion", "name": "Notion MCP", "status": "available"}]

    async def register_connection(self, connection_id: str) -> None:
        logger.info("MCP register stub for connection %s", connection_id)

    async def unregister(self, connection_id: str) -> None:
        logger.info("MCP unregister stub for connection %s", connection_id)

    async def list_tools(self, connection_id: str | None = None) -> list[dict]:
        return []

    async def invoke(self, tool: str, args: dict) -> dict:
        return {"ok": True, "tool": tool, "stub": True}


mcp_service = McpService()
