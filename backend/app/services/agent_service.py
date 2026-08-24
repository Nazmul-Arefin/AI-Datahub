"""Agent orchestration — API → AgentService → DeepSeek Harness."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any
from uuid import uuid4

SOURCE_MISSION_HINTS: dict[str, tuple[str, ...]] = {
    "gmail": ("gmail", "email", "e-mail", "inbox", "mail", "message"),
    "calendar": ("calendar", "event", "meeting", "schedule", "agenda"),
    "notion": ("notion", "workspace"),
    "wechat": ("wechat", "weixin", "微信"),
    "feishu": ("feishu", "lark", "飞书"),
    "discord": ("discord",),
    "coze": ("coze", "扣子"),
    "anthropic-mcp": ("anthropic",),
}


def infer_sources_for_mission(mission: str, authorized: list[tuple[str, str]]) -> list[tuple[str, str]]:
    """Pick authorized sources mentioned in the mission; otherwise all authorized."""
    haystack = str(mission or "").lower()
    if not haystack or not authorized:
        return list(authorized)
    matched: list[tuple[str, str]] = []
    for source_id, name in authorized:
        tokens = (
            source_id,
            name,
            *SOURCE_MISSION_HINTS.get(source_id, ()),
        )
        if any(str(token).lower() in haystack for token in tokens if token):
            matched.append((source_id, name))
    return matched or list(authorized)


def _provider_refresh_enabled() -> bool:
    """Live Nango/AstrBot only — skip in pytest/mock so unit tests do not overwrite real syncs."""
    nango = os.getenv("NANGO_MODE", "").lower()
    astrbot = os.getenv("ASTRBOT_MODE", "").lower()
    if not nango or not astrbot:
        try:
            from app.core.config import settings

            nango = nango or str(getattr(settings, "nango_mode", "")).lower()
            astrbot = astrbot or str(getattr(settings, "astrbot_mode", "")).lower()
        except Exception:
            pass
    return nango == "live" or astrbot == "live"


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
        self._background: set[asyncio.Task] = set()

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

                if SessionLocal is None:
                    return _goal_to_dict(goal)
                db = SessionLocal()
                try:
                    goal = self._goal_service().get_goal(goal_id, db=db)
                finally:
                    db.close()
            return _goal_to_dict(goal)
        except Exception:
            logger.exception("Failed to load goal %s for agent context", goal_id)
            return None

    def _authorized_live_sources(self) -> list[tuple[str, str]]:
        """Sources with a real provider connection — not seed/demo rows."""
        try:
            from app.core.database import SessionLocal
            from app.models.source import DataSource

            if SessionLocal is None:
                return []
            db = SessionLocal()
            try:
                rows = (
                    db.query(DataSource)
                    .filter(DataSource.status_type == "connected")
                    .order_by(DataSource.name)
                    .all()
                )
                live: list[tuple[str, str]] = []
                for row in rows:
                    connection = row.connection
                    if not connection:
                        continue
                    status = str(connection.status or "").lower()
                    if status and status not in {"connected", "active", "authorized"}:
                        continue
                    provider = str(connection.auth_provider or "").lower()
                    has_link = bool(connection.external_connection_id) or provider == "astrbot"
                    if has_link and row.id:
                        live.append((row.id, row.name or row.id))
                return live
            finally:
                db.close()
        except Exception:
            logger.exception("Failed to list authorized live sources")
            return []

    async def _refresh_sources_for_mission(
        self,
        mission: str,
        source_ids: list[str] | None = None,
    ) -> list[str]:
        """Live-sync each MCP the mission will use before the agent reads it."""
        if not _provider_refresh_enabled():
            return []
        authorized = self._authorized_live_sources()
        if source_ids:
            wanted = {str(item).lower() for item in source_ids if item}
            targets = [
                (source_id, name)
                for source_id, name in authorized
                if source_id.lower() in wanted or any(token in source_id.lower() or token in name.lower() for token in wanted)
            ] or infer_sources_for_mission(mission, authorized)
        else:
            targets = infer_sources_for_mission(mission, authorized)
        if not targets:
            return []

        from app.core.database import SessionLocal
        from app.services.sync_service import sync_service

        if SessionLocal is None:
            return []

        gate = asyncio.Semaphore(3)

        async def _sync_one(source_id: str) -> str | None:
            async with gate:
                db = SessionLocal()
                try:
                    await asyncio.wait_for(sync_service.sync_source(source_id, db=db), timeout=90)
                    db.commit()
                    logger.info("Refreshed source %s for agent mission", source_id)
                    return source_id
                except Exception:
                    db.rollback()
                    logger.warning("Live refresh failed for source %s", source_id, exc_info=True)
                    return None
                finally:
                    db.close()

        refreshed = await asyncio.gather(*(_sync_one(source_id) for source_id, _name in targets))
        return [source_id for source_id in refreshed if source_id]

    def _load_synced_snippets(self, *, limit: int = 24, source_ids: list[str] | None = None) -> tuple[list[str], list[dict[str, Any]]]:
        """Pull recent synced_assets after a live refresh."""
        resolved_ids: list[str] = list(source_ids or [])
        snippets: list[dict[str, Any]] = []
        try:
            from app.core.database import SessionLocal
            from app.models.source import DataSource
            from app.models.synced_asset import SyncedAsset

            if SessionLocal is None:
                return resolved_ids, snippets
            db = SessionLocal()
            try:
                if not resolved_ids:
                    resolved_ids = [source_id for source_id, _name in self._authorized_live_sources()]
                if not resolved_ids:
                    sources = (
                        db.query(DataSource)
                        .filter(DataSource.status_type == "connected")
                        .order_by(DataSource.name)
                        .all()
                    )
                    resolved_ids = [row.id for row in sources if row.id]
                if not resolved_ids:
                    return [], []
                rows = (
                    db.query(SyncedAsset)
                    .filter(SyncedAsset.source_id.in_(resolved_ids))
                    .order_by(SyncedAsset.synced_at.desc())
                    .limit(max(limit * 2, 48))
                    .all()
                )
                def _recency(row: Any):
                    raw = str(getattr(row, "last_edited_at", None) or "").split(" (")[0].strip()
                    if raw:
                        try:
                            from email.utils import parsedate_to_datetime

                            return parsedate_to_datetime(raw)
                        except Exception:
                            pass
                    return getattr(row, "synced_at", None)

                rows = sorted(rows, key=_recency, reverse=True)[:limit]
                for row in rows:
                    synced_at = row.synced_at.isoformat() if getattr(row, "synced_at", None) else ""
                    snippets.append(
                        {
                            "sourceId": row.source_id,
                            "title": row.title,
                            "content": (row.content_text or "")[:400],
                            "objectType": row.object_type,
                            "url": row.url,
                            "syncedAt": synced_at,
                            "lastEditedAt": row.last_edited_at,
                        }
                    )
            finally:
                db.close()
        except Exception:
            logger.exception("Failed to load synced assets for agent context")
            return resolved_ids, snippets
        return resolved_ids, snippets

    async def _build_context(
        self,
        mission: str,
        goal_id: str | None,
        *,
        refresh: bool = True,
        source_ids: list[str] | None = None,
    ) -> dict:
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
        refreshed_ids = (
            await self._refresh_sources_for_mission(mission, source_ids=source_ids)
            if refresh
            else []
        )
        snippet_ids = refreshed_ids or source_ids or None
        source_ids, snippets = self._load_synced_snippets(source_ids=snippet_ids)

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
            refreshed_source_ids=refreshed_ids,
        )

    async def _harness_turn(
        self,
        prompt: str,
        goal_id: str | None,
        context: dict,
        role: str,
    ) -> dict:
        try:
            try:
                return await self._client.start_run(prompt, goal_id, context=context, role=role)
            except TypeError:
                return await self._client.start_run(prompt, goal_id, context=context)
        except Exception as exc:
            logger.warning("Harness %s failed, using fallback: %s", role, exc)
            try:
                return await self._fallback.start_run(prompt, goal_id, context=context, role=role)
            except TypeError:
                return await self._fallback.start_run(prompt, goal_id, context=context)

    def _spawn(self, coro) -> None:
        task = asyncio.create_task(coro)
        self._background.add(task)
        task.add_done_callback(self._background.discard)

    def _seed_plan(self, mission: str, context: dict) -> dict:
        authorized = [source_id for source_id, _name in self._authorized_live_sources()]
        inferred = infer_sources_for_mission(mission, self._authorized_live_sources())
        sources = [source_id for source_id, _name in inferred] or authorized[:3]
        return {
            "headline": (mission or "Use Data mission")[:80],
            "workPlan": [
                {"title": "Review authorized sources", "detail": "Confirm which MCP data is needed"},
                {"title": "Read live synced items", "detail": "Use the refreshed payload, not stale memory"},
                {"title": "Answer the mission", "detail": "Write findings and a next move"},
            ],
            "guidelinePlan": [
                {"title": "Use only authorized data", "detail": "Do not invent private facts"},
                {"title": "Prefer live-synced items", "detail": "Treat refreshed MCP data as current"},
                {"title": "State gaps plainly", "detail": "Say what is missing instead of guessing"},
            ],
            "sourcesUsed": sources,
        }

    async def _execute_stage(
        self,
        run_id: str,
        mission: str,
        goal_id: str | None,
        plans: dict,
        route: str,
    ) -> None:
        from app.services.weeple_plan import parse_weeple_plan, strip_plan_fences

        record = self._store.get(run_id) or {"runId": run_id}
        record.update(
            {
                "status": "executing",
                "stage": "executing",
                "events": list(record.get("events") or [])
                + [{"type": "stage", "text": "Refreshing planned MCP sources, then the main agent will execute."}],
            }
        )
        self._store.save(strip_secrets(record))
        try:
            context = await self._build_context(
                mission,
                goal_id,
                refresh=True,
                source_ids=plans.get("sourcesUsed") or None,
            )
            record = self._store.get(run_id) or record
            record["context"] = context
            record["refreshedSourceIds"] = list(context.get("refreshedSourceIds") or [])
            self._store.save(strip_secrets(record))
            prompt = self._builder.format_execute_prompt(mission, context, plans=plans)
            result = await self._harness_turn(prompt, goal_id, context, "execution")
            summary = strip_plan_fences(_summary_from_result(result) or "") or _summary_from_result(result) or ""
            extra = parse_weeple_plan(_summary_from_result(result) or "")
            record.update(
                {
                    "executionSessionId": result.get("sessionId") or result.get("runId"),
                    "sessionId": result.get("sessionId") or record.get("sessionId"),
                    "status": "completed",
                    "stage": "completed",
                    "phase": 8,
                    "progress": 1.0,
                    "summary": summary,
                    "findings": extra.get("findings") or record.get("findings") or [],
                    "recommendation": extra.get("recommendation") or record.get("recommendation"),
                    "events": list(record.get("events") or [])
                    + [{"type": "stage", "text": "Main agent finished the planned work."}]
                    + list(result.get("events") or []),
                    "mode": result.get("mode") or record.get("mode"),
                    "context": context,
                }
            )
            if extra.get("headline") and not record.get("headline"):
                record["headline"] = extra["headline"]
            saved = self._store.save(strip_secrets(record))
            try:
                from app.core.database import SessionLocal
                from app.services.activity_service import activity_service

                db = SessionLocal() if SessionLocal is not None else None
                if db is not None:
                    try:
                        activity_service.record(
                            "Agent run completed",
                            (saved.get("summary") or f"Run {run_id} finished")[:280],
                            route=route,
                            related_goal_id=goal_id,
                            related_run_id=run_id,
                            db=db,
                        )
                        db.commit()
                    finally:
                        db.close()
            except Exception:
                logger.debug("Could not record completion activity for %s", run_id, exc_info=True)
        except Exception:
            logger.exception("Execution agent failed for %s", run_id)
            record.update({"status": "failed", "stage": "failed", "phase": 8})
            self._store.save(strip_secrets(record))

    async def run(self, mission: str, goal_id: str | None = None) -> dict:
        from app.services.activity_service import activity_service
        from app.services.weeple_plan import parse_weeple_plan

        route = "goals" if goal_id else "use-data"
        run_id = f"run-{uuid4().hex[:12]}"
        try:
            from app.core.database import SessionLocal

            db = SessionLocal() if SessionLocal is not None else None
        except Exception:
            db = None

        try:
            if db is not None:
                activity_service.record(
                    "Agent run started",
                    (mission or "Mission")[:160],
                    route=route,
                    related_goal_id=goal_id,
                    db=db,
                )
            plan_context = await self._build_context(mission, goal_id, refresh=False)
            seed = {
                "runId": run_id,
                "status": "planning",
                "stage": "planning",
                "phase": 2,
                "progress": 0.2,
                "mission": mission,
                "goalId": goal_id,
                "events": [{"type": "stage", "text": "Planning agent is choosing MCPs, work steps, and guidelines."}],
                "context": plan_context,
                "mode": plan_context.get("mode"),
            }
            self._store.save(strip_secrets(seed))

            plan_prompt = self._builder.format_plan_prompt(mission, plan_context)
            plan_result = await self._harness_turn(plan_prompt, goal_id, plan_context, "planning")
            plans = parse_weeple_plan(_summary_from_result(plan_result) or "")
            if not plans.get("workPlan") or not plans.get("guidelinePlan"):
                seed_plan = self._seed_plan(mission, plan_context)
                plans = {
                    "headline": plans.get("headline") or seed_plan["headline"],
                    "workPlan": plans.get("workPlan") or seed_plan["workPlan"],
                    "guidelinePlan": plans.get("guidelinePlan") or seed_plan["guidelinePlan"],
                    "sourcesUsed": plans.get("sourcesUsed") or seed_plan["sourcesUsed"],
                    "findings": plans.get("findings") or [],
                    "recommendation": plans.get("recommendation") or "",
                }

            planned = {
                **seed,
                "planningSessionId": plan_result.get("sessionId") or plan_result.get("runId"),
                "sessionId": plan_result.get("sessionId") or f"session-{run_id}",
                "status": "executing",
                "stage": "executing",
                "phase": 4,
                "progress": 0.45,
                "workPlan": plans.get("workPlan") or [],
                "guidelinePlan": plans.get("guidelinePlan") or [],
                "sourcesUsed": plans.get("sourcesUsed") or [],
                "headline": plans.get("headline") or "",
                "recommendation": plans.get("recommendation") or "",
                "findings": [],
                "summary": None,
                "planPhase": {
                    "workPlan": plans.get("workPlan") or [],
                    "guidelinePlan": plans.get("guidelinePlan") or [],
                    "sourcesUsed": plans.get("sourcesUsed") or [],
                },
                "refreshedSourceIds": [],
                "context": plan_context,
                "mode": plan_result.get("mode") or plan_context.get("mode"),
                "events": list(seed.get("events") or [])
                + [
                    {
                        "type": "stage",
                        "text": "Planning complete. Main agent is following the plan.",
                    }
                ],
            }
            saved = self._store.save(strip_secrets(planned))
            if db is not None:
                db.commit()

            live_pipeline = (
                getattr(self._client, "mode", None) == "live"
                and str(plan_result.get("mode") or "") == "live"
            )
            if live_pipeline:
                self._spawn(self._execute_stage(run_id, mission, goal_id, plans, route))
                return strip_secrets(saved)

            await self._execute_stage(run_id, mission, goal_id, plans, route)
            return strip_secrets(self._store.get(run_id) or saved)
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
        if record:
            stage = str(record.get("stage") or record.get("status") or "").lower()
            exec_sid = record.get("executionSessionId")
            if exec_sid and stage in {"executing", "running"}:
                try:
                    live = await self._client.get_run(str(exec_sid), session_id=str(exec_sid))
                except Exception:
                    live = None
                if live:
                    from app.services.weeple_plan import strip_plan_fences

                    summary = strip_plan_fences(_summary_from_result(live) or "") or _summary_from_result(live)
                    if summary and str(live.get("status") or "").lower() in {
                        "completed",
                        "complete",
                        "succeeded",
                        "success",
                    }:
                        record = {
                            **record,
                            "status": "completed",
                            "stage": "completed",
                            "phase": 8,
                            "progress": 1.0,
                            "summary": summary,
                            "events": list(record.get("events") or []) + list(live.get("events") or []),
                        }
                        return strip_secrets(self._store.save(record))
            return strip_secrets(record)
        try:
            live = await self._client.get_run(run_id, session_id=None)
        except Exception:
            live = None
        if live:
            return strip_secrets(self._store.save({**live, "runId": run_id}))
        try:
            fallback = await self._fallback.get_run(run_id)
        except Exception:
            fallback = None
        if not fallback:
            return None
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
