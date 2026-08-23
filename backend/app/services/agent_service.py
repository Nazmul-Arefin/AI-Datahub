"""Agent orchestration — API → AgentService → DeepSeek Harness."""

from __future__ import annotations

import logging
from typing import Any

from app.adapters.agent_harness import harness_client
from app.adapters.agent_harness.fallback import fallback_loop_adapter
from app.adapters.agent_harness.store import agent_run_store
from app.adapters.mcp_gateway.registry import strip_secrets
from app.services.context_builder import context_builder

logger = logging.getLogger(__name__)


def _summary_from_result(result: dict) -> str | None:
    if result.get("summary"):
        return str(result["summary"])[:12000]
    for item in reversed(list(result.get("events") or [])):
        if isinstance(item, dict) and item.get("text"):
            return str(item["text"])[:12000]
    return None


def _goal_to_dict(goal: Any) -> dict[str, Any] | None:
    if goal is None:
        return None
    if isinstance(goal, dict):
        return goal
    dump = getattr(goal, "model_dump", None)
    if callable(dump):
        try:
            return dump(by_alias=True)
        except TypeError:
            return dump()
    data: dict[str, Any] = {}
    for key in (
        "id",
        "title",
        "category",
        "status",
        "outcome",
        "description",
        "constraints",
        "subgoals",
        "progress",
    ):
        if hasattr(goal, key):
            data[key] = getattr(goal, key)
    return data or None


class AgentService:
    def __init__(
        self,
        client=harness_client,
        mcp=None,
        memory=None,
        builder=context_builder,
        fallback=fallback_loop_adapter,
        store=agent_run_store,
    ) -> None:
        self._client = client
        self._mcp = mcp
        self._memory = memory
        self._builder = builder
        self._fallback = fallback
        self._store = store

    def _mcp_service(self):
        if self._mcp is not None:
            return self._mcp
        from app.services.mcp_service import mcp_service

        return mcp_service

    def _memory_service(self):
        if self._memory is not None:
            return self._memory
        from app.services.memory_service import memory_service

        return memory_service

    def _goal_service(self):
        from app.services.goal_service import goal_service

        return goal_service

    def _load_goal(self, goal_id: str | None) -> dict[str, Any] | None:
        if not goal_id:
            return None
        try:
            goal = self._goal_service().get_goal(goal_id, db=None)
            if goal is None:
                # DB session path for live API
                from app.core.database import SessionLocal

                db = SessionLocal()
                try:
                    goal = self._goal_service().get_goal(goal_id, db=db)
                finally:
                    db.close()
            return _goal_to_dict(goal)
        except Exception:
            logger.exception("Failed to load goal %s for agent context", goal_id)
            return None

    def _load_synced_snippets(self, *, limit: int = 24) -> tuple[list[str], list[dict[str, Any]]]:
        """Pull recent synced_assets across connected sources for grounding."""
        source_ids: list[str] = []
        snippets: list[dict[str, Any]] = []
        try:
            from app.core.database import SessionLocal
            from app.models.source import DataSource
            from app.models.synced_asset import SyncedAsset

            db = SessionLocal()
            try:
                sources = (
                    db.query(DataSource)
                    .filter(DataSource.status_type == "connected")
                    .order_by(DataSource.name)
                    .all()
                )
                source_ids = [row.id for row in sources if row.id]
                if not source_ids:
                    return [], []
                rows = (
                    db.query(SyncedAsset)
                    .filter(SyncedAsset.source_id.in_(source_ids))
                    .order_by(SyncedAsset.synced_at.desc())
                    .limit(limit)
                    .all()
                )
                for row in rows:
                    snippets.append(
                        {
                            "sourceId": row.source_id,
                            "title": row.title,
                            "content": (row.content_text or "")[:400],
                            "objectType": row.object_type,
                            "url": row.url,
                        }
                    )
            finally:
                db.close()
        except Exception:
            logger.exception("Failed to load synced assets for agent context")
            return source_ids, snippets
        return source_ids, snippets

    async def _build_context(self, mission: str, goal_id: str | None) -> dict:
        query = mission or goal_id or ""
        memories: list[dict] = []
        try:
            found = await self._memory_service().search(query)
            memories = list(found.get("items") or [])[:8]
        except Exception:
            memories = []

        tools = await self.list_allowed_tools()
        names = [item.get("name") for item in tools.get("tools") or [] if item.get("name")]
        goal = self._load_goal(goal_id)
        source_ids, snippets = self._load_synced_snippets()

        mode = "mock"
        if getattr(self._client, "mode", None) == "live":
            mode = "live"
        return self._builder.build(
            goal_id=goal_id,
            goal=goal,
            source_ids=source_ids,
            allowed_tools=list(dict.fromkeys(names)),
            memories=memories,
            snippets=snippets,
            mode=mode,
        )

    async def run(self, mission: str, goal_id: str | None = None) -> dict:
        from app.services.activity_service import activity_service

        route = "goals" if goal_id else "use-data"
        try:
            from app.core.database import SessionLocal

            db = SessionLocal()
        except Exception:
            db = None

        try:
            activity_service.record(
                "Agent run started",
                (mission or "Mission")[:160],
                route=route,
                related_goal_id=goal_id,
                db=db,
            )
            context = await self._build_context(mission, goal_id)
            # One harness turn: ask for plans + answer together (fast, realtime).
            prompt = self._builder.format_execute_prompt(mission, context, plans=None)
            try:
                result = await self._client.start_run(prompt, goal_id, context=context)
            except Exception as exc:
                logger.warning("Harness run failed, using fallback: %s", exc)
                result = await self._fallback.start_run(prompt, goal_id, context=context)

            from app.services.weeple_plan import parse_weeple_plan, strip_plan_fences

            result.setdefault("context", context)
            result.setdefault("events", [])
            summary = _summary_from_result(result) or ""
            plans = parse_weeple_plan(summary)
            if plans.get("workPlan"):
                result["workPlan"] = plans["workPlan"]
            if plans.get("guidelinePlan"):
                result["guidelinePlan"] = plans["guidelinePlan"]
            if plans.get("findings"):
                result["findings"] = plans["findings"]
            if plans.get("sourcesUsed"):
                result["sourcesUsed"] = plans["sourcesUsed"]
            if plans.get("headline"):
                result["headline"] = plans["headline"]
            if plans.get("recommendation"):
                result["recommendation"] = plans["recommendation"]
            if summary:
                result["summary"] = strip_plan_fences(summary) or summary
            # Ensure UI never receives a "completed" shell with no answer.
            if result.get("summary") and str(result.get("status") or "").lower() not in {
                "failed",
                "error",
                "cancelled",
            }:
                result["status"] = "completed"
                result["phase"] = 8
                result["progress"] = 1.0
            result["planPhase"] = {
                "workPlan": plans.get("workPlan") or [],
                "guidelinePlan": plans.get("guidelinePlan") or [],
                "sourcesUsed": plans.get("sourcesUsed") or [],
            }

            saved = self._store.save(strip_secrets(result))
            status = str(saved.get("status") or "").lower()
            if status in {"completed", "complete", "succeeded", "success"}:
                activity_service.record(
                    "Agent run completed",
                    (saved.get("summary") or f"Run {saved.get('runId') or 'unknown'} finished")[:280],
                    route=route,
                    related_goal_id=goal_id,
                    related_run_id=saved.get("runId"),
                    db=db,
                )
            elif status in {"failed", "error"}:
                activity_service.record(
                    "Agent run failed",
                    f"Run {saved.get('runId') or 'unknown'} reported an error",
                    route=route,
                    related_goal_id=goal_id,
                    related_run_id=saved.get("runId"),
                    db=db,
                )
            if db is not None:
                db.commit()
            return strip_secrets(saved)
        except Exception:
            if db is not None:
                db.rollback()
            raise
        finally:
            if db is not None:
                db.close()

    async def start_run(self, mission: str, goal_id: str | None = None) -> dict:
        return await self.run(mission, goal_id)

    async def get_run(self, run_id: str) -> dict | None:
        record = self._store.get(run_id)
        live = None
        try:
            live = await self._client.get_run(run_id, session_id=(record or {}).get("sessionId"))
        except Exception:
            live = None
        if live:
            merged = {**(record or {}), **live, "runId": run_id}
            # Live harness poll can omit structured plan fields saved after plan+execute.
            for key in (
                "workPlan",
                "guidelinePlan",
                "findings",
                "sourcesUsed",
                "headline",
                "recommendation",
                "planPhase",
                "summary",
            ):
                if not merged.get(key) and isinstance(record, dict) and record.get(key):
                    merged[key] = record[key]
            summary = _summary_from_result(merged)
            if summary:
                merged["summary"] = summary
            previous_status = str((record or {}).get("status") or "").lower()
            saved = strip_secrets(self._store.save(merged))
            status = str(saved.get("status") or "").lower()
            newly_done = status in {"completed", "complete", "succeeded", "success"} and previous_status not in {
                "completed",
                "complete",
                "succeeded",
                "success",
            }
            if newly_done and summary:
                try:
                    from app.core.database import SessionLocal
                    from app.services.activity_service import activity_service

                    db = SessionLocal()
                    try:
                        activity_service.record(
                            "Agent run completed",
                            summary[:280],
                            route="use-data",
                            related_run_id=run_id,
                            db=db,
                        )
                        db.commit()
                    finally:
                        db.close()
                except Exception:
                    logger.debug("Could not record completion activity for %s", run_id, exc_info=True)
            return saved
        if record:
            summary = _summary_from_result(record)
            if summary and not record.get("summary"):
                record = {**record, "summary": summary}
            return strip_secrets(record)
        try:
            fallback = await self._fallback.get_run(run_id)
        except Exception:
            fallback = None
        if not fallback:
            return None
        summary = _summary_from_result(fallback)
        if summary:
            fallback = {**fallback, "summary": summary}
        return strip_secrets(fallback)

    async def list_allowed_tools(self) -> dict:
        """Tool names/ids only — never credential refs or tokens."""
        catalog = await self._mcp_service().list_catalog()
        tools: list[dict] = []
        for server in catalog.get("servers") or []:
            server_id = server.get("serverId")
            for tool in server.get("tools") or []:
                tools.append(
                    {
                        "name": tool.get("name"),
                        "description": tool.get("description"),
                        "serverId": server_id,
                        "serverName": server.get("name"),
                    }
                )
        return strip_secrets({"tools": tools, "mode": catalog.get("mode")})


agent_service = AgentService()
