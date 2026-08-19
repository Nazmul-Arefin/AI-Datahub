"""Ping official local sidecars. No secrets printed.

  docker compose --env-file backend/.env up -d
  cd backend; python scripts/ping_real_sidecars.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.config import Settings  # noqa: E402
from app.services.sidecar_health_service import SidecarHealthService  # noqa: E402


async def main() -> int:
    settings = Settings(
        nango_url="http://localhost:3003",
        memory_service_url="http://localhost:8420",
        agent_harness_url="http://localhost:3080",
        astrbot_url="http://localhost:6185",
        mcp_gateway_url="http://localhost:8080",
        nango_mode="live",
        memory_mode="live",
        harness_mode="live",
        astrbot_mode="live",
        mcp_gateway_mode="live",
        sidecar_health_timeout_seconds=5.0,
    )
    result = await SidecarHealthService(settings=settings).check_all()
    print(f"SIDECARS {result.status}")
    failed = False
    for item in result.sidecars:
        print(f"  {item.name:12} {item.status:4} {item.mode:4} {item.detail} {item.url}")
        if item.status != "ok":
            failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
