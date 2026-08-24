"""Assemble goal + memory + synced data + allowed MCP tools for agent runs."""

from __future__ import annotations

import json
from typing import Any


class ContextBuilder:
    def build(
        self,
        *,
        goal_id: str | None = None,
        goal: dict[str, Any] | None = None,
        source_ids: list[str] | None = None,
        allowed_tools: list[str] | None = None,
        memories: list[dict] | None = None,
        snippets: list[dict] | None = None,
        mode: str = "mock",
        refreshed_source_ids: list[str] | None = None,
    ) -> dict[str, Any]:
        return {
            "goalId": goal_id,
            "goal": goal or None,
            "sourceIds": source_ids or [],
            "allowedTools": list(allowed_tools or []),
            "memories": list(memories or []),
            "snippets": list(snippets or []),
            "mode": mode,
            "refreshedSourceIds": list(refreshed_source_ids or []),
        }

    def format_prompt(self, mission: str, context: dict[str, Any] | None = None) -> str:
        ctx = context or {}
        lines = [
            "You are Weeple, a personal AI OS assistant.",
            "Use only the provided goal context, memories, and synced data.",
            "If data is missing, say what is missing instead of inventing facts.",
            f"Mission: {mission}",
        ]

        goal = ctx.get("goal") if isinstance(ctx.get("goal"), dict) else None
        if goal:
            lines.append("Active goal:")
            lines.append(f"- Title: {goal.get('title') or goal.get('id') or 'Untitled'}")
            if goal.get("category"):
                lines.append(f"- Category: {goal.get('category')}")
            if goal.get("status"):
                lines.append(f"- Status: {goal.get('status')}")
            if goal.get("outcome") or goal.get("description"):
                lines.append(f"- Outcome: {goal.get('outcome') or goal.get('description')}")
            if goal.get("constraints"):
                lines.append(f"- Constraints: {goal.get('constraints')}")
            subgoals = goal.get("subgoals") or []
            if subgoals:
                lines.append("- Subgoals:")
                for item in subgoals[:8]:
                    if isinstance(item, dict):
                        name = item.get("name") or item.get("title") or "subgoal"
                        status = item.get("status") or ("done" if item.get("confirmed") else "open")
                        lines.append(f"  - {name} ({status})")
                    else:
                        lines.append(f"  - {item}")
        elif ctx.get("goalId"):
            lines.append(f"Goal id: {ctx['goalId']}")

        memories = ctx.get("memories") or []
        if memories:
            lines.append("Memories:")
            for item in memories[:8]:
                title = str(item.get("title") or item.get("id") or "memory")
                body = str(item.get("content") or item.get("summary") or "")[:240]
                lines.append(f"- {title}: {body}")

        snippets = ctx.get("snippets") or []
        refreshed = ctx.get("refreshedSourceIds") or []
        if refreshed:
            lines.append(
                "These MCP sources were live-synced just now for this run: "
                + ", ".join(str(item) for item in refreshed)
            )
        if snippets:
            lines.append("Live synced data (refreshed for this run — treat as current, not stale):")
            for item in snippets[:24]:
                source = str(item.get("sourceId") or item.get("source") or "source")
                title = str(item.get("title") or "Untitled")[:160]
                body = str(item.get("content") or item.get("contentText") or "")[:320]
                synced_at = str(item.get("syncedAt") or "").strip()
                edited_at = str(item.get("lastEditedAt") or "").strip()
                stamp = f" @ {synced_at}" if synced_at else ""
                dated = f" dated {edited_at}" if edited_at else ""
                lines.append(f"- [{source}{stamp}{dated}] {title}: {body}")

        tools = ctx.get("allowedTools") or []
        if tools:
            lines.append(
                "Allowed MCP tools (names only; never request or emit secrets): "
                + ", ".join(str(t) for t in tools)
            )

        lines.append("Answer the mission clearly for the user.")
        lines.append(
            "Format the answer as readable Markdown with a short title (#), "
            "a ## Findings section (3-6 insight bullets, not raw email dumps), "
            "and a ## Recommended next move section."
        )
        lines.append(
            "Optionally include one fenced ```html``` block with a compact, "
            "self-contained infographic (inline CSS only, no scripts) for the "
            "Use Data report canvas."
        )
        lines.append("Do not invent OAuth tokens, credentials, or private data not present above.")
        return "\n".join(lines)

    def format_plan_prompt(self, mission: str, context: dict[str, Any] | None = None) -> str:
        ctx = context or {}
        source_hint = ", ".join(str(item) for item in (ctx.get("sourceIds") or [])[:12]) or "authorized synced sources"
        return "\n".join(
            [
                "You are Weeple's Planning Agent — a separate DSH agent from the execution agent.",
                "Your only job is to plan. Do not solve the mission and do not write the user answer.",
                f"Mission: {mission}",
                f"Authorized MCP sources available: {source_hint}",
                "Return ONLY one fenced JSON block with language tag weeple-plan:",
                "```weeple-plan",
                "{",
                '  "headline": "short mission title",',
                '  "workPlan": [{"title":"task","detail":"why the main agent must do this"}],',
                '  "guidelinePlan": [{"title":"guideline","detail":"rule the main agent must follow"}],',
                '  "sourcesUsed": ["gmail"]',
                "}",
                "```",
                "Rules:",
                "- workPlan: 3-6 concrete steps the MAIN agent will execute, in order",
                "- guidelinePlan: 3-5 quality/safety guidelines for the MAIN agent",
                "- sourcesUsed: only authorized MCP source ids the main agent should refresh and read",
                "- No markdown outside the JSON fence. No invented private data.",
            ]
        )

    def format_execute_prompt(
        self,
        mission: str,
        context: dict[str, Any] | None = None,
        plans: dict[str, Any] | None = None,
    ) -> str:
        base = self.format_prompt(mission, context)
        plan = plans or {}
        work = plan.get("workPlan") or []
        guides = plan.get("guidelinePlan") or []
        sources_used = plan.get("sourcesUsed") or []
        return "\n".join(
            [
                "You are Weeple's Execution Agent — a separate DSH agent from the planning agent.",
                "Follow the approved plan. Do not invent a new plan. Do not output a weeple-plan block.",
                base,
                "",
                "Approved work plan (do these steps in order):",
                json.dumps(work, ensure_ascii=False),
                "",
                "Guidelines you must follow:",
                json.dumps(guides, ensure_ascii=False),
                "",
                "MCP sources to use:",
                json.dumps(sources_used, ensure_ascii=False),
                "",
                "Write the Markdown answer for the user now.",
                "Optionally add one ```html``` infographic (inline CSS, no scripts).",
                "Do not repeat the planning JSON.",
            ]
        )


context_builder = ContextBuilder()
