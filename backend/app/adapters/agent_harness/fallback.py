"""LLM fallback loop — same start_run/get_run shape as HarnessClient."""

from __future__ import annotations

from uuid import uuid4

from app.services.llm_service import llm_service


class FallbackLoopAdapter:
    def __init__(self, llm=llm_service) -> None:
        self._llm = llm
        self._runs: dict[str, dict] = {}

    async def start_run(
        self,
        mission: str,
        goal_id: str | None = None,
        context: dict | None = None,
    ) -> dict:
        reply = await self._llm.chat([{"role": "user", "content": mission}], max_tokens=2048)
        text = str(reply.get("content") or "")
        run_id = f"run-fb-{uuid4().hex[:10]}"
        record = {
            "runId": run_id,
            "sessionId": f"session-fallback-{uuid4().hex[:8]}",
            "status": "completed",
            "mission": mission,
            "goalId": goal_id,
            "phase": 2,
            "progress": 1.0,
            "events": [
                {"type": "user/message", "seq": 0, "text": mission[:400]},
                {"type": "assistant/message", "seq": 1, "text": text[:800]},
            ],
            "summary": text[:2000],
            "context": context or {},
            "mode": "fallback",
        }
        self._runs[run_id] = record
        return dict(record)

    async def get_run(self, run_id: str, session_id: str | None = None) -> dict | None:
        record = self._runs.get(run_id)
        return dict(record) if record else None


fallback_loop_adapter = FallbackLoopAdapter()
