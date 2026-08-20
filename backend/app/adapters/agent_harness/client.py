"""DeepSeek Harness adapter — live dsh web RPC, or in-process mock."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

import httpx

from app.core.config import settings


def compact_events(raw: list[Any], limit: int = 24) -> list[dict[str, Any]]:
    compact: list[dict[str, Any]] = []
    for item in raw[-limit:]:
        event = item.get("event", item) if isinstance(item, dict) else {}
        if not isinstance(event, dict):
            continue
        entry: dict[str, Any] = {"type": event.get("type"), "seq": event.get("seq")}
        data = event.get("data") if isinstance(event.get("data"), dict) else {}
        content = data.get("content")
        if isinstance(content, list):
            texts = [part.get("text") for part in content if isinstance(part, dict) and part.get("text")]
            if texts:
                entry["text"] = " ".join(str(t) for t in texts)[:400]
        compact.append(entry)
    return compact


def status_from_events(events: list[dict[str, Any]]) -> tuple[str, int, float]:
    types = {item.get("type") for item in events}
    if "turn/end" in types or "assistant/message" in types:
        return "completed", 2, 1.0
    if "turn/start" in types or "user/message" in types:
        return "running", 1, 0.45
    return "queued", 0, 0.0


class HarnessClient:
    def __init__(
        self,
        base_url: str | None = None,
        mode: str | None = None,
        model: str | None = None,
    ) -> None:
        self.base_url = (base_url or settings.agent_harness_url).rstrip("/")
        self.mode = mode or settings.harness_mode
        self.model = model or settings.llm_deepseek_model
        self._runs: dict[str, dict] = {}
        self._poll_counts: dict[str, int] = {}

    def _mock_assistant_text(self, mission: str) -> str:
        text = str(mission or "").strip()
        lowered = text.lower()
        if ("observation" in lowered and "prediction" in lowered) or "goal intelligence" in lowered:
            return (
                '{"observations":['
                '{"type":"context","title":"Plan pressure","detail":"Open work and timing are shaping the next decision.",'
                '"source":"AI analysis","time":"Now","influence":78},'
                '{"type":"calendar","title":"Execution window","detail":"Protect the next useful block before momentum fades.",'
                '"source":"Goal schedule","time":"Live","influence":71}'
                '],"prediction":{"probability":74,"risk":"ON TRACK",'
                '"title":"Current signals support progress if the next confirmed move lands soon.",'
                '"impact":"Next milestone","window":"This week","confidence":"Medium-high confidence"},'
                '"suggestions":[{"label":"NEXT MOVE","title":"Advance the highest-leverage open work.",'
                '"action":"Prepare next step","options":["Today","Tomorrow","Choose time"]}]}'
            )
        if "subgoal" in lowered and ("json" in lowered or "[" in text):
            return (
                '[{"name":"Clarify measurable success"},'
                '{"name":"Complete the first useful milestone"}]'
            )
        if ("suggestion" in lowered or "next move" in lowered) and (
            "json" in lowered or "[" in text
        ):
            return (
                '[{"label":"NEXT MOVE","title":"Advance the highest-leverage open work.",'
                '"action":"Prepare next step","options":["Today","Tomorrow","Choose time"]}]'
            )
        if "goal plan" in lowered and ("json" in lowered or "{" in text):
            return (
                '{"category":"Project","subgoals":['
                '{"name":"Clarify measurable success","tasks":["Define the outcome"]},'
                '{"name":"Ship the first milestone","tasks":["Draft the smallest useful step"]}'
                '],"observations":[{"type":"context","title":"Fresh goal brief","detail":"Only the confirmed outcome is available so far.",'
                '"source":"User input","time":"Now","influence":70}],'
                '"prediction":{"probability":58,"risk":"EARLY INFERENCE",'
                '"title":"First milestone confidence rises after the opening review.",'
                '"impact":"First milestone","window":"After first review","confidence":"Low-medium confidence"},'
                '"suggestions":[{"label":"FIRST MOVE","title":"Define one measurable result.",'
                '"action":"Define Result","options":["This week","This month"]}]}'
            )
        preview = text[:180] if text else "goal work"
        return f"Prepared output ready for review: {preview}"

    async def _rpc(self, method: str, payload: dict | None = None, timeout: float = 20.0) -> dict:
        rpc_id = str(uuid4())
        envelope = {
            "type": "client-request",
            "rpcId": rpc_id,
            "method": method,
            "payload": payload or {},
        }
        headers = {
            "Content-Type": "application/json",
            # dsh web only trusts loopback Host names; Compose DNS is otherwise 403.
            "Host": "127.0.0.1:3080",
        }
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/{method}",
                headers=headers,
                json=envelope,
            )
            response.raise_for_status()
            body = response.json()
        result = body.get("result") if isinstance(body, dict) else None
        if not isinstance(result, dict) or not result.get("ok"):
            error = (result or {}).get("error") if isinstance(result, dict) else body
            raise RuntimeError(f"harness {method} failed: {error}")
        value = result.get("value")
        return value if isinstance(value, dict) else {"value": value}

    def _mock_start(self, mission: str, goal_id: str | None, context: dict | None) -> dict:
        run_id = f"run-{uuid4().hex[:10]}"
        record = {
            "runId": run_id,
            "sessionId": f"session-mock-{uuid4().hex[:8]}",
            "status": "queued",
            "mission": mission,
            "goalId": goal_id,
            "phase": 0,
            "progress": 0.0,
            "events": [],
            "context": context or {},
            "mode": "mock",
        }
        self._runs[run_id] = record
        return dict(record)

    async def start_run(
        self,
        mission: str,
        goal_id: str | None = None,
        context: dict | None = None,
    ) -> dict:
        if self.mode != "live":
            return self._mock_start(mission, goal_id, context)
        created = await self._rpc("session.create", {})
        session_id = created.get("sessionId") or f"session-{uuid4().hex[:8]}"
        try:
            await self._rpc(
                "session.selectModel",
                {"sessionId": session_id, "provider": "deepseek-official", "model": self.model},
            )
        except Exception:
            pass
        await self._rpc(
            "session.prompt",
            {
                "sessionId": session_id,
                "mode": "queue",
                "content": [{"type": "text", "text": mission}],
            },
        )
        events: list[dict[str, Any]] = []
        try:
            history = await self._rpc("session.history", {"sessionId": session_id, "maxMessages": 20})
            events = compact_events(history.get("events") or [])
        except Exception:
            events = [{"type": "session/prompt", "seq": 0, "text": mission[:200]}]
        status, phase, progress = status_from_events(events)
        if status == "queued":
            status, phase, progress = "running", 1, 0.2
        record = {
            "runId": session_id,
            "sessionId": session_id,
            "status": status,
            "mission": mission,
            "goalId": goal_id,
            "phase": phase,
            "progress": progress,
            "events": events,
            "context": context or {},
            "mode": "live",
        }
        self._runs[session_id] = record
        return dict(record)

    async def get_run(self, run_id: str, session_id: str | None = None) -> dict | None:
        if self.mode != "live":
            record = self._runs.get(run_id)
            if not record:
                return None
            # Mock runs must progress so Goals/Use polling is honest (not stuck forever).
            count = self._poll_counts.get(run_id, 0) + 1
            self._poll_counts[run_id] = count
            mission = str(record.get("mission") or "")
            updated = dict(record)
            if count <= 1:
                updated.update(
                    {
                        "status": "running",
                        "phase": 1,
                        "progress": 0.45,
                        "events": [
                            {"type": "user/message", "seq": 0, "text": mission[:400]},
                            {"type": "turn/start", "seq": 1, "text": "Working"},
                        ],
                        "summary": None,
                    }
                )
            else:
                assistant = self._mock_assistant_text(mission)
                updated.update(
                    {
                        "status": "completed",
                        "phase": 2,
                        "progress": 1.0,
                        "events": [
                            {"type": "user/message", "seq": 0, "text": mission[:400]},
                            {"type": "assistant/message", "seq": 1, "text": assistant[:800]},
                        ],
                        "summary": assistant[:2000],
                    }
                )
            self._runs[run_id] = updated
            return dict(updated)
        sid = session_id or run_id
        history = await self._rpc("session.history", {"sessionId": sid, "maxMessages": 40})
        events = compact_events(history.get("events") or [])
        status, phase, progress = status_from_events(events)
        summary = None
        for item in reversed(events):
            if item.get("text"):
                summary = str(item["text"])[:2000]
                break
        record = {
            "runId": run_id,
            "sessionId": sid,
            "status": status,
            "phase": phase,
            "progress": progress,
            "events": events,
            "summary": summary,
            "mode": "live",
        }
        self._runs[run_id] = {**self._runs.get(run_id, {}), **record}
        return dict(self._runs[run_id])


harness_client = HarnessClient()
