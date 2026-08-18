"""MCP gateway adapter."""

from app.core.config import settings


class McpGatewayClient:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or settings.mcp_gateway_url


mcp_gateway_client = McpGatewayClient()
