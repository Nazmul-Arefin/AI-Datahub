"""Ping DeepSeek through LLMService. Never prints the API key.

Usage (from backend/):
  $env:PYTHONPATH = (Get-Location).Path
  python scripts/ping_llm.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.services.llm_service import llm_service  # noqa: E402


async def main() -> int:
    result = await llm_service.ping()
    mode = result.get("mode", "unknown")
    preview = result.get("preview", "")
    print(f"LLM {mode}: ok")
    print(f"model: {result.get('model')}")
    print(f"preview: {preview}")
    return 0 if result.get("status") == "ok" else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
