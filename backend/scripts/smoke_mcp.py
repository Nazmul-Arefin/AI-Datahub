"""T6 smoke: register one GitHub connection → list_tools → invoke. No secrets printed."""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.adapters.mcp_gateway.client import McpGatewayClient  # noqa: E402
from app.core.config import Settings  # noqa: E402
from app.services.agent_service import AgentService  # noqa: E402
from app.services.auth_connector import AuthConnector  # noqa: E402
from app.services.mcp_service import McpService  # noqa: E402


SECRET_KEYS = {"accessToken", "access_token", "refreshToken", "refresh_token", "token", "secret"}


def _guard(payload: object) -> None:
    blob = json.dumps(payload)
    for key in SECRET_KEYS:
        if f'"{key}"' in blob:
            raise SystemExit(f"refusing to print payload that contains {key}")


async def main() -> int:
    settings = Settings()
    client = McpGatewayClient(mode=settings.mcp_gateway_mode)
    mcp = McpService(client=client, settings=settings)
    start = await AuthConnector().authorize("github")
    _guard(start)
    connection_id = start.get("state") or "conn-github-t6"
    registered = await mcp.register(connection_id=connection_id, name="github")
    _guard(registered)
    tools = await mcp.list_tools(registered["serverId"])
    _guard(tools)
    invoked = await mcp.invoke("list_repos", {"org": "acme"}, server_id=registered["serverId"])
    _guard(invoked)
    allowed = await AgentService(mcp=mcp).list_allowed_tools()
    _guard(allowed)
    print("MCP register:", registered.get("serverId"), registered.get("name"), registered.get("mode"))
    print("MCP tools:", [item.get("name") for item in tools.get("tools", [])])
    print("MCP invoke:", invoked.get("ok"), invoked.get("tool"), invoked.get("auditId"))
    print("Agent tools:", [item.get("name") for item in allowed.get("tools", [])][:8])
    return 0 if invoked.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
