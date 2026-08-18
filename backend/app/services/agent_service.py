"""Agent orchestration — wire to agent_harness adapter in Phase 3."""


class AgentService:
    async def start_run(self, mission: str, goal_id: str | None = None) -> dict[str, str]:
        return {"runId": "run-stub-1", "status": "queued"}

    async def get_run(self, run_id: str) -> dict[str, str | int | float]:
        return {"runId": run_id, "status": "running", "phase": 1, "progress": 0.35}


agent_service = AgentService()
