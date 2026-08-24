"""DeepSeek Harness adapter — live dsh web RPC, or in-process mock."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any
from uuid import uuid4

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def compact_events(raw: list[Any], limit: int = 80) -> list[dict[str, Any]]:
    compact: list[dict[str, Any]] = []
    for item in raw[-limit:]:
        if not isinstance(item, dict):
            continue
        # History may be {event:{...}} or a bare message/event object.
        event = item.get("event") if isinstance(item.get("event"), dict) else item
        if not isinstance(event, dict):
            continue
        entry: dict[str, Any] = {
            "type": event.get("type") or event.get("role") or event.get("kind"),
            "seq": event.get("seq"),
        }
        data = event.get("data") if isinstance(event.get("data"), dict) else {}
        content = data.get("content")
        if not isinstance(content, list):
            message = data.get("message") if isinstance(data.get("message"), dict) else {}
            content = message.get("content") if isinstance(message.get("content"), list) else None
        if not isinstance(content, list) and isinstance(event.get("content"), list):
            content = event.get("content")
        if isinstance(content, list):
            text_parts = [
                str(part.get("text"))
                for part in content
                if isinstance(part, dict)
                and part.get("text")
                and str(part.get("type") or "").lower() in {"text", "output_text", ""}
            ]
            if not text_parts:
                text_parts = [
                    str(part.get("text"))
                    for part in content
                    if isinstance(part, dict) and part.get("text") and str(part.get("type") or "").lower() != "reasoning"
                ]
            if text_parts:
                entry["text"] = " ".join(text_parts)[:12000]
        if not entry.get("text"):
            for key in ("text", "content", "output_text", "message", "body"):
                value = data.get(key) if key in data else event.get(key)
                if isinstance(value, str) and value.strip():
                    entry["text"] = value.strip()[:12000]
                    break
                if isinstance(value, dict) and value.get("text"):
                    entry["text"] = str(value.get("text"))[:12000]
                    break
        # Assistant role with text counts as assistant message for completion checks.
        role = str(event.get("role") or data.get("role") or "").lower()
        if role in {"assistant", "model"} and entry.get("text"):
            entry["type"] = entry.get("type") or "assistant/message"
        compact.append(entry)
    return compact


def _is_usable_answer(text: str | None) -> bool:
    value = str(text or "").strip()
    lowered = value.lower()
    if "```weeple-plan" in lowered or '"workplan"' in lowered:
        return len(value) >= 20
    if len(value) < 40:
        return False
    noise = (
        "current runtime context",
        "current dsh file policy",
        "supersedes earlier runtime-context",
        "workspace-write",
        "you are weeple planning a use data mission",
        "you are weeple's planning agent",
        "you are weeple's execution agent",
        "return only one fenced json",
    )
    if any(token in lowered[:220] for token in noise):
        return False
    return True


def summary_from_events(events: list[dict[str, Any]]) -> str | None:
    candidates: list[str] = []
    for item in events or []:
        if not isinstance(item, dict) or not item.get("text"):
            continue
        typ = str(item.get("type") or "").lower()
        text = str(item["text"]).strip()
        if not _is_usable_answer(text):
            continue
        if typ in {"assistant/message", "assistant/final", "message", "assistant"} or typ.startswith("assistant"):
            candidates.append(text[:12000])
        elif typ not in {"user/message", "user", "session/prompt", "system"}:
            candidates.append(text[:12000])
    if candidates:
        return candidates[-1]
    # Last resort: any usable text that is not clearly the user prompt.
    for item in reversed(events or []):
        if isinstance(item, dict) and _is_usable_answer(item.get("text")):
            typ = str(item.get("type") or "").lower()
            if typ in {"user/message", "user", "session/prompt"}:
                continue
            return str(item["text"]).strip()[:12000]
    return None


def status_from_events(events: list[dict[str, Any]]) -> tuple[str, int, float]:
    types = {str(item.get("type") or "") for item in events}
    lower = {item.lower() for item in types}
    has_answer = any(
        _is_usable_answer(item.get("text"))
        and str(item.get("type") or "").lower() in {"assistant/message", "assistant/final", "message", "assistant"}
        for item in events
        if isinstance(item, dict)
    )
    if "turn/end" in lower or has_answer:
        return "completed", 8, 1.0
    if any(
        _is_usable_answer(item.get("text")) and str(item.get("type") or "").lower().startswith("assistant")
        for item in events
        if isinstance(item, dict)
    ):
        return "completed", 8, 1.0
    if "turn/start" in lower or "user/message" in lower or "user" in lower:
        return "running", 4, 0.55
    return "queued", 1, 0.15


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

    def _mock_start(
        self,
        mission: str,
        goal_id: str | None,
        context: dict | None,
        role: str | None = None,
    ) -> dict:
        run_id = f"run-{uuid4().hex[:10]}"
        if role == "planning":
            summary = (
                "```weeple-plan\n"
                '{"headline":"Mock mission","workPlan":[{"title":"Parse request","detail":"mock"}],'
                '"guidelinePlan":[{"title":"Use authorized data","detail":"mock"}],'
                '"sourcesUsed":["gmail"],"recommendation":"Switch harness to live"}\n'
                "```"
            )
        else:
            summary = (
                f"# Mock result\n\nAnswered: {mission[:240]}\n\n"
                "## Findings\n- Harness mock mode completed the planned work.\n\n"
                "## Recommended next move\n- Switch harness to live for real MCP data."
            )
        record = {
            "runId": run_id,
            "sessionId": f"session-mock-{uuid4().hex[:8]}",
            "status": "completed",
            "mission": mission,
            "goalId": goal_id,
            "phase": 8,
            "progress": 1.0,
            "events": [{"type": "assistant/message", "seq": 1, "text": summary}],
            "summary": summary,
            "context": context or {},
            "mode": "mock",
            "role": role,
        }
        self._runs[run_id] = record
        return dict(record)

    async def _read_history(self, session_id: str) -> list[dict[str, Any]]:
        history = await self._rpc(
            "session.history",
            {"sessionId": session_id, "maxMessages": 120},
            timeout=30.0,
        )
        raw = history.get("events") or history.get("messages") or history.get("items") or []
        if not isinstance(raw, list):
            raw = []
        return compact_events(raw, limit=120)

    async def _await_session_answer(
        self,
        session_id: str,
        *,
        timeout_s: float = 240.0,
        poll_s: float = 1.25,
    ) -> tuple[list[dict[str, Any]], str | None, str, int, float]:
        """Block until DSH produces an assistant answer (or timeout)."""
        deadline = time.monotonic() + timeout_s
        last_events: list[dict[str, Any]] = []
        while time.monotonic() < deadline:
            try:
                events = await self._read_history(session_id)
            except Exception as exc:
                logger.warning("harness history poll failed: %s", exc)
                await asyncio.sleep(poll_s)
                continue
            last_events = events
            status, phase, progress = status_from_events(events)
            summary = summary_from_events(events)
            if summary and _is_usable_answer(summary) and (status == "completed" or len(summary) > 80):
                return events, summary, "completed", 8, 1.0
            await asyncio.sleep(poll_s)
        summary = summary_from_events(last_events)
        status, phase, progress = status_from_events(last_events)
        if summary and _is_usable_answer(summary):
            return last_events, summary, "completed", 8, 1.0
        return last_events, summary, status or "running", phase or 4, progress or 0.5

    async def start_run(
        self,
        mission: str,
        goal_id: str | None = None,
        context: dict | None = None,
        role: str | None = None,
    ) -> dict:
        if self.mode != "live":
            return self._mock_start(mission, goal_id, context, role=role)
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
            timeout=120.0,
        )
        # CRITICAL: session.prompt returns when queued, NOT when the model finishes.
        events, summary, status, phase, progress = await self._await_session_answer(
            session_id,
            timeout_s=90.0 if role == "planning" else 240.0,
        )
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
        if summary:
            record["summary"] = summary
        self._runs[session_id] = record
        return dict(record)

    async def get_run(self, run_id: str, session_id: str | None = None) -> dict | None:
        if self.mode != "live":
            record = self._runs.get(run_id)
            return dict(record) if record else None
        sid = session_id or run_id
        try:
            events = await self._read_history(sid)
        except Exception as exc:
            logger.warning("harness get_run history failed: %s", exc)
            cached = self._runs.get(run_id)
            return dict(cached) if cached else None
        status, phase, progress = status_from_events(events)
        summary = summary_from_events(events)
        if summary and status != "completed":
            status, phase, progress = "completed", 8, 1.0
        record = {
            "runId": run_id,
            "sessionId": sid,
            "status": status,
            "phase": phase,
            "progress": progress,
            "events": events,
            "mode": "live",
        }
        if summary:
            record["summary"] = summary
        self._runs[run_id] = {**self._runs.get(run_id, {}), **record}
        return dict(self._runs[run_id])


harness_client = HarnessClient()
