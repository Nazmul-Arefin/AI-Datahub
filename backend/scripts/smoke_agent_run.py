"""T7 smoke: store a memory, start an agent run, print session/events. No secrets."""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.agent_service import AgentService  # noqa: E402
from app.services.memory_service import MemoryService  # noqa: E402


def _guard(payload: object) -> None:
    blob = json.dumps(payload)
    for key in ("accessToken", "access_token", "refreshToken", "refresh_token"):
        if f'"{key}"' in blob:
            raise SystemExit(f"refusing payload that contains {key}")


async def main() -> int:
    memory = MemoryService()
    stored = await memory.store(
        title="T7 morning focus",
        content="Deep work 08:30-10:00",
        source="demo",
    )
    _guard(stored)
    service = AgentService(memory=memory)
    started = await service.run("Plan tomorrow morning around the focus window.", goal_id="goal-t7")
    _guard(started)
    fetched = await service.get_run(started["runId"])
    _guard(fetched)
    print("memory:", stored.get("id"), stored.get("title"))
    print("run:", started.get("runId"), started.get("status"), started.get("mode"), started.get("sessionId"))
    print("tools:", (started.get("context") or {}).get("allowedTools"))
    print("events:", [item.get("type") for item in fetched.get("events") or []][:12])
    return 0 if started.get("runId") and started.get("sessionId") else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
