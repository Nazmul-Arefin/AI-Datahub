"""T7 live: AgentService → local dsh web RPC. Skips if Harness is down."""

from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_live_harness_creates_session_and_events():
    from app.adapters.agent_harness.client import HarnessClient

    client = HarnessClient(base_url="http://localhost:3080", mode="live")
    try:
        started = await client.start_run("Reply with the single word pong. Do not use tools.")
    except Exception as exc:
        pytest.skip(f"harness not reachable: {exc}")
    assert started["mode"] == "live"
    assert started["sessionId"]
    assert started["status"] in {"queued", "running", "completed"}
    fetched = await client.get_run(started["runId"], session_id=started["sessionId"])
    types = {item.get("type") for item in fetched.get("events") or []}
    assert "user/message" in types or "turn/start" in types or fetched["status"] in {"running", "completed"}
