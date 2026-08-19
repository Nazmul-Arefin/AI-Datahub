"""Store → search → recall a fact through MemoryService. Never prints secrets.

Usage (from backend/):
  $env:PYTHONPATH = (Get-Location).Path
  python scripts/smoke_memory.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.memory_service import MemoryService  # noqa: E402


async def main() -> int:
    service = MemoryService()
    stored = await service.store(
        title="T4 smoke",
        content="User prefers deep work before 10:00.",
        source="demo",
    )
    memory_id = stored["id"]
    hits = await service.search("deep work")
    recalled = await service.recall(memory_id)
    ok = recalled is not None and hits["total"] >= 1
    print(f"MEMORY {stored.get('mode', 'mock')}: {'ok' if ok else 'fail'}")
    print(f"id: {memory_id}")
    print(f"recall: {recalled['content'] if recalled else None}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
