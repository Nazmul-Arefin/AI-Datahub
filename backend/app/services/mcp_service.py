"""MCP connector catalog and tool routing."""


class McpService:
    async def list_connectors(self) -> list[dict[str, str]]:
        return [{"id": "notion", "name": "Notion MCP", "status": "available"}]


mcp_service = McpService()
