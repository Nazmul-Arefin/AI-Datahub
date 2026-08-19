"""MCP gateway adapter — in-process mock registry or HTTP sidecar."""

from __future__ import annotations

from pathlib import Path

import httpx

from app.adapters.mcp_gateway.registry import McpRegistry, strip_secrets
from app.core.config import settings

_BACKEND_ROOT = Path(__file__).resolve().parents[3]
_DEFAULT_AUDIT = _BACKEND_ROOT / "data" / "mcp_audit.jsonl"


class McpGatewayClient:
    def __init__(
        self,
        base_url: str | None = None,
        mode: str | None = None,
        audit_path: Path | None = None,
    ) -> None:
        self.base_url = (base_url or settings.mcp_gateway_url).rstrip("/")
        self.mode = mode or settings.mcp_gateway_mode
        self._registry = McpRegistry(audit_path=audit_path or _DEFAULT_AUDIT, mode=self.mode)

    async def list_servers(self) -> list[dict]:
        if self.mode == "live":
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/servers")
                response.raise_for_status()
                data = response.json()
            servers = data.get("servers", data) if isinstance(data, dict) else data
            return strip_secrets(list(servers))
        return self._registry.list_servers()

    async def register(
        self,
        *,
        connection_id: str,
        name: str,
        tools: list[dict] | None = None,
        credential_ref: str | None = None,
    ) -> dict:
        if self.mode == "live":
            payload = {
                "connectionId": connection_id,
                "name": name,
                "tools": tools,
                "credentialRef": credential_ref,
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(f"{self.base_url}/register", json=payload)
                response.raise_for_status()
                return strip_secrets(response.json())
        return self._registry.register(
            connection_id=connection_id,
            name=name,
            tools=tools,
            credential_ref=credential_ref,
        )

    async def list_tools(self, server_id: str) -> list[dict]:
        if self.mode == "live":
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/servers/{server_id}/tools")
                response.raise_for_status()
                data = response.json()
            tools = data.get("tools", data) if isinstance(data, dict) else data
            return strip_secrets(list(tools))
        return self._registry.list_tools(server_id)

    async def invoke(self, tool: str, args: dict | None = None, server_id: str | None = None) -> dict:
        if self.mode == "live":
            payload = {"tool": tool, "args": args or {}, "serverId": server_id}
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(f"{self.base_url}/invoke", json=payload)
                response.raise_for_status()
                return strip_secrets(response.json())
        return self._registry.invoke(tool, args, server_id=server_id)

    async def list_audit(self) -> list[dict]:
        if self.mode == "live":
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/audit")
                response.raise_for_status()
                data = response.json()
            events = data.get("events", data) if isinstance(data, dict) else data
            return strip_secrets(list(events))
        return self._registry.list_audit()


mcp_gateway_client = McpGatewayClient()
