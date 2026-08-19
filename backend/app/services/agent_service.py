"""Agent orchestration — API → AgentService → DeepSeek Harness."""

import logging

from app.adapters.agent_harness import harness_client
from app.adapters.agent_harness.fallback import fallback_loop_adapter
from app.adapters.agent_harness.store import agent_run_store
from app.adapters.mcp_gateway.registry import strip_secrets
from app.services.context_builder import context_builder

logger = logging.getLogger(__name__)


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
        mode = "mock"
        if getattr(self._client, "mode", None) == "live":
            mode = "live"
        return self._builder.build(
            goal_id=goal_id,
            allowed_tools=list(dict.fromkeys(names)),
            memories=memories,
            mode=mode,
        )

    async def run(self, mission: str, goal_id: str | None = None) -> dict:
        context = await self._build_context(mission, goal_id)
        prompt = self._builder.format_prompt(mission, context)
        try:
            result = await self._client.start_run(prompt, goal_id, context=context)
        except Exception as exc:
            logger.warning("Harness run failed, using fallback: %s", exc)
            result = await self._fallback.start_run(prompt, goal_id, context=context)
        result.setdefault("context", context)
        result.setdefault("events", [])
        saved = self._store.save(strip_secrets(result))
        return strip_secrets(saved)

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
            return strip_secrets(self._store.save(merged))
        if record:
            return strip_secrets(record)
        try:
            fallback = await self._fallback.get_run(run_id)
        except Exception:
            fallback = None
        return strip_secrets(fallback) if fallback else None

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
