"""Assemble goal + memory + allowed MCP tools for agent runs."""

from __future__ import annotations

from typing import Any


class ContextBuilder:
    def build(
        self,
        *,
        goal_id: str | None = None,
        source_ids: list[str] | None = None,
        allowed_tools: list[str] | None = None,
        memories: list[dict] | None = None,
        mode: str = "mock",
    ) -> dict[str, Any]:
        return {
            "goalId": goal_id,
            "sourceIds": source_ids or [],
            "allowedTools": list(allowed_tools or []),
            "memories": list(memories or []),
            "snippets": [],
            "mode": mode,
        }

    def format_prompt(self, mission: str, context: dict[str, Any] | None = None) -> str:
        ctx = context or {}
        lines = [f"Mission: {mission}"]
        if ctx.get("goalId"):
            lines.append(f"Goal id: {ctx['goalId']}")
        memories = ctx.get("memories") or []
        if memories:
            lines.append("Memories:")
            for item in memories[:8]:
                title = str(item.get("title") or item.get("id") or "memory")
                body = str(item.get("content") or item.get("summary") or "")[:240]
                lines.append(f"- {title}: {body}")
        tools = ctx.get("allowedTools") or []
        if tools:
            lines.append(
                "Allowed MCP tools (names only; never request or emit secrets): " + ", ".join(str(t) for t in tools)
            )
        lines.append("Answer the mission. Do not invent OAuth tokens or credentials.")
        return "\n".join(lines)


context_builder = ContextBuilder()
