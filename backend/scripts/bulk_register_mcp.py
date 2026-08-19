"""Load N MCP connector definitions from JSON into the registry.

Proves the scale path: add connectors as data, not new FastAPI routers.

Usage (from backend/):
  $env:PYTHONPATH = (Get-Location).Path
  python scripts/bulk_register_mcp.py
  python scripts/bulk_register_mcp.py scripts/fixtures/mcp_connectors.json
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("MCP_GATEWAY_MODE", "mock")
os.environ.setdefault("DEEPSEEK_API_KEY", "")

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.adapters.mcp_gateway.client import McpGatewayClient  # noqa: E402
from app.adapters.mcp_gateway.registry import strip_secrets  # noqa: E402
from app.core.config import Settings  # noqa: E402
from app.services.mcp_service import McpService  # noqa: E402

DEFAULT_FIXTURE = Path(__file__).resolve().parent / "fixtures" / "mcp_connectors.json"


def _load_connectors(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    connectors = data.get("connectors", data) if isinstance(data, dict) else data
    if not isinstance(connectors, list) or not connectors:
        raise SystemExit(f"no connectors in {path}")
    return connectors


async def register_all(path: Path) -> dict:
    settings = Settings(mcp_gateway_mode="mock")
    mcp = McpService(client=McpGatewayClient(mode="mock"), settings=settings)
    registered: list[dict] = []
    for item in _load_connectors(path):
        name = str(item.get("name") or "connector")
        record = await mcp.register(
            connection_id=f"conn-bulk-{name}",
            name=name,
            tools=item.get("tools"),
        )
        registered.append(
            {
                "name": record.get("name"),
                "serverId": record.get("serverId"),
                "category": item.get("category"),
                "auth_type": item.get("auth_type"),
                "tools": [tool.get("name") for tool in record.get("tools") or []],
            }
        )
    catalog = await mcp.list_catalog()
    payload = {
        "added": len(registered),
        "message": f"added {len(registered)} connectors without new routers",
        "connectors": registered,
        "catalogSize": len(catalog.get("servers") or []),
    }
    return strip_secrets(payload)


def main() -> int:
    parser = argparse.ArgumentParser(description="Bulk-register MCP connectors from JSON")
    parser.add_argument("fixture", nargs="?", default=str(DEFAULT_FIXTURE))
    args = parser.parse_args()
    path = Path(args.fixture)
    if not path.is_file():
        print(f"missing fixture: {path}", file=sys.stderr)
        return 1
    result = asyncio.run(register_all(path))
    print(result["message"])
    print(f"catalogSize: {result['catalogSize']}")
    for item in result["connectors"]:
        print(f"  {item['name']:18} {item.get('auth_type')} {item.get('serverId')} tools={item.get('tools')}")
    return 0 if result["added"] >= 1 else 1


if __name__ == "__main__":
    raise SystemExit(main())
