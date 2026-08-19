"""Service-level agent run records. Dev1 has no agent_runs table yet."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_BACKEND_ROOT = Path(__file__).resolve().parents[3]
_DEFAULT_PATH = _BACKEND_ROOT / "data" / "agent_runs.jsonl"


class AgentRunStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or _DEFAULT_PATH
        self._runs: dict[str, dict[str, Any]] = {}
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._load()

    def _load(self) -> None:
        if not self.path.is_file():
            return
        for line in self.path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            run_id = record.get("runId") if isinstance(record, dict) else None
            if run_id:
                self._runs[str(run_id)] = record

    def save(self, record: dict[str, Any]) -> dict[str, Any]:
        run_id = record.get("runId")
        if not run_id:
            return record
        self._runs[run_id] = dict(record)
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, default=str) + "\n")
        return dict(record)

    def get(self, run_id: str) -> dict[str, Any] | None:
        record = self._runs.get(run_id)
        return dict(record) if record else None

    def list(self) -> list[dict[str, Any]]:
        return [dict(item) for item in self._runs.values()]


agent_run_store = AgentRunStore()
