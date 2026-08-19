"""T8 smoke: list platforms, connect Telegram, show MCP row. No secrets printed."""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.messaging_service import MessagingService  # noqa: E402


def _guard(payload: object) -> None:
    blob = json.dumps(payload)
    for key in ("accessToken", "telegram_token", "botToken", "password"):
        if f'"{key}"' in blob:
            raise SystemExit(f"refusing payload that contains {key}")


async def main() -> int:
    service = MessagingService()
    platforms = await service.list_platforms()
    _guard(platforms)
    connected = await service.connect("telegram")
    _guard(connected)
    sources = await service.list_sources()
    _guard(sources)
    print("platforms:", [item.get("id") for item in platforms.get("platforms", [])], platforms.get("mode"))
    print("card:", (connected.get("card") or {}).get("title"))
    print("source:", connected.get("sourceId"), "mcp:", connected.get("mcpServerId"))
    print("sources:", len(sources.get("sources") or []))
    return 0 if connected.get("mcpServerId") else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
