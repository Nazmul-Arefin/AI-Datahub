"""Parse structured Weeple plan JSON from harness text."""

from __future__ import annotations

import json
import re
from typing import Any


_PLAN_FENCE = re.compile(
    r"```(?:weeple-plan|json)\s*([\s\S]*?)```",
    re.IGNORECASE,
)


def _as_step(item: Any) -> dict[str, str] | None:
    if isinstance(item, str) and item.strip():
        return {"title": item.strip()[:120], "detail": ""}
    if not isinstance(item, dict):
        return None
    title = str(item.get("title") or item.get("name") or item.get("step") or "").strip()
    if not title:
        return None
    detail = str(item.get("detail") or item.get("description") or item.get("subtitle") or "").strip()
    return {"title": title[:120], "detail": detail[:200]}


def _as_finding(item: Any) -> dict[str, str] | None:
    if isinstance(item, str) and item.strip():
        return {"title": item.strip()[:100], "detail": ""}
    if not isinstance(item, dict):
        return None
    title = str(item.get("title") or item.get("name") or item.get("finding") or "").strip()
    if not title:
        return None
    detail = str(item.get("detail") or item.get("description") or item.get("summary") or "").strip()
    return {"title": title[:100], "detail": detail[:280]}


def parse_weeple_plan(text: str | None) -> dict[str, Any]:
    """Extract workPlan / guidelinePlan / findings / sourcesUsed from model text."""
    raw = str(text or "").strip()
    if not raw:
        return {}

    candidates: list[str] = []
    for match in _PLAN_FENCE.finditer(raw):
        candidates.append(match.group(1).strip())
    if raw.startswith("{"):
        candidates.append(raw)

    for blob in candidates:
        try:
            data = json.loads(blob)
        except Exception:
            continue
        if not isinstance(data, dict):
            continue
        work = [_as_step(item) for item in (data.get("workPlan") or data.get("tasks") or [])]
        guides = [_as_step(item) for item in (data.get("guidelinePlan") or data.get("guidelines") or [])]
        findings = [_as_finding(item) for item in (data.get("findings") or [])]
        sources = data.get("sourcesUsed") or data.get("sources") or []
        return {
            "workPlan": [item for item in work if item][:8],
            "guidelinePlan": [item for item in guides if item][:8],
            "findings": [item for item in findings if item][:8],
            "sourcesUsed": [str(item).strip() for item in sources if str(item).strip()][:12],
            "headline": str(data.get("headline") or data.get("title") or "").strip()[:160],
            "recommendation": str(data.get("recommendation") or "").strip()[:400],
        }
    return {}


def strip_plan_fences(text: str | None) -> str:
    """Remove plan JSON fences so the user-facing summary stays readable."""
    return _PLAN_FENCE.sub("", str(text or "")).strip()
