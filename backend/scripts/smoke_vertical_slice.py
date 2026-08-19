"""Day-5 vertical slice in mock mode: connect + memory + Harness run.

Usage (from backend/):
  $env:PYTHONPATH = (Get-Location).Path
  python scripts/smoke_vertical_slice.py
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

os.environ["DEEPSEEK_API_KEY"] = ""
os.environ["MCP_GATEWAY_MODE"] = "mock"
os.environ["HARNESS_MODE"] = "mock"
os.environ["MEMORY_MODE"] = "mock"
os.environ["ASTRBOT_MODE"] = "mock"
os.environ["NANGO_MODE"] = "mock"

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.adapters.agent_harness.client import HarnessClient  # noqa: E402
from app.adapters.agent_harness.store import AgentRunStore  # noqa: E402
from app.adapters.mcp_gateway.client import McpGatewayClient  # noqa: E402
from app.adapters.mcp_gateway.registry import strip_secrets  # noqa: E402
from app.adapters.nango.client import NangoClient  # noqa: E402
from app.services.agent_service import AgentService  # noqa: E402
from app.services.auth_connector import AuthConnector  # noqa: E402
from app.services.mcp_service import McpService  # noqa: E402
from app.services.memory_service import MemoryService  # noqa: E402
from app.services.messaging_service import MessagingService  # noqa: E402


SECRET_KEYS = {"accessToken", "access_token", "refreshToken", "refresh_token", "telegram_token"}


def _guard(payload: object) -> None:
    blob = json.dumps(payload)
    for key in SECRET_KEYS:
        if f'"{key}"' in blob:
            raise SystemExit(f"refusing payload that contains {key}")


async def run_slice() -> dict:
    mcp = McpService(client=McpGatewayClient(mode="mock"))
    auth = AuthConnector(client=NangoClient(mode="mock", secret_key=""))
    messaging = MessagingService(mcp=mcp)
    memory = MemoryService()
    agent = AgentService(
        client=HarnessClient(mode="mock"),
        mcp=mcp,
        memory=memory,
        store=AgentRunStore(path=ROOT / "data" / "agent_runs_smoke.jsonl"),
    )

    connect = await auth.authorize("github")
    _guard(connect)
    registered = await mcp.register(
        connection_id=connect.get("state") or "conn-github-smoke",
        name="github",
    )
    _guard(registered)
    telegram = await messaging.connect("telegram")
    _guard(telegram)
    stored = await memory.store(
        title="Smoke focus window",
        content="Deep work 08:30-10:00",
        source="demo",
    )
    recalled = await memory.recall(stored["id"])
    started = await agent.run("Plan tomorrow around the focus window.", goal_id="goal-smoke")
    _guard(started)

    ok = all(
        [
            "authorizationUrl" in connect,
            registered.get("serverId"),
            telegram.get("mcpServerId"),
            recalled and "08:30" in recalled.get("content", ""),
            started.get("runId") and started.get("sessionId"),
            started.get("mode") == "mock",
        ]
    )
    return strip_secrets(
        {
            "ok": ok,
            "nango": {"authorizationUrl": connect.get("authorizationUrl"), "mode": connect.get("mode")},
            "mcp": {"serverId": registered.get("serverId"), "name": registered.get("name")},
            "telegram": {
                "card": (telegram.get("card") or {}).get("title"),
                "sourceId": telegram.get("sourceId"),
                "mcpServerId": telegram.get("mcpServerId"),
            },
            "memory": {"id": stored.get("id"), "recalled": bool(recalled)},
            "run": {
                "runId": started.get("runId"),
                "sessionId": started.get("sessionId"),
                "status": started.get("status"),
                "mode": started.get("mode"),
                "tools": (started.get("context") or {}).get("allowedTools"),
            },
        }
    )


async def main() -> int:
    result = await run_slice()
    print("VERTICAL SLICE", "ok" if result["ok"] else "fail")
    print(f"nango: {result['nango']['mode']} {result['nango']['authorizationUrl']}")
    print(f"mcp: {result['mcp']['name']} {result['mcp']['serverId']}")
    print(f"telegram: {result['telegram']['card']} {result['telegram']['mcpServerId']}")
    print(f"memory: {result['memory']['id']} recalled={result['memory']['recalled']}")
    print(
        "run:",
        result["run"]["runId"],
        result["run"]["status"],
        result["run"]["mode"],
        "tools=",
        result["run"]["tools"],
    )
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
