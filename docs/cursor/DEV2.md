# DEV2 — AI + sidecars

You are **Developer 2**. **Live checklist:** [TODO.md](TODO.md). Details: [DEV2-TASKS.md](DEV2-TASKS.md). Team plan: [plan.md](../../plan.md).

**Owns:** DeepSeek Harness, AstrBot, Nango, MCP gateway/registry, TencentDB memory, LLM, ContextBuilder, Compose sidecar wiring, offline mock modes.

**Does not own:** Postgres catalog/goals/tasks/overview models, catalog seed matching Import filters, Goal schema design.

## Path allowlist (edit these)

```text
backend/app/adapters/**
backend/app/services/agent_service.py
backend/app/services/messaging_service.py
backend/app/services/memory_service.py
backend/app/services/mcp_service.py
backend/app/services/auth_connector.py
backend/app/services/context_builder.py
backend/app/services/llm_service.py
backend/app/services/knowledge_service.py
backend/app/api/agents.py
backend/app/api/mcp.py
backend/app/api/memories.py
backend/app/api/messaging.py
backend/app/api/health.py          # sidecar health only; keep /health compatible
backend/app/schemas/mcp.py
backend/app/schemas/agents.py      # allowed tools for AgentService
docker-compose.yml                 # sidecar services
backend/scripts/                   # ping, bulk-register, smoke
docs/licenses.md
docs/mcp-catalog.md
docs/cursor/DEV2.md
docs/cursor/DEV2-TASKS.md
docs/cursor/TODO.md
```

## Do not edit (Dev1)

```text
backend/app/models/**
backend/alembic/**
backend/app/api/auth.py
backend/app/api/goals.py
backend/app/api/tasks.py
backend/app/api/sources.py
backend/app/api/overview.py
backend/app/api/integrations.py    # HTTP surface is Dev1; they call your AuthConnector
backend/app/services/goal_service.py
backend/app/services/task_service.py
backend/app/services/source_service.py
backend/app/services/overview_service.py
backend/app/services/seed_data.py
frontend/**
```

`backend/app/schemas/` — **day-owner**. Coordinate before changing Goal/catalog contracts. You may add fields needed by agent/memory/messaging **after** a morning rebase discussion.

## Hard rules

1. Product agents: `API → AgentService → DeepSeek Harness` (or `FallbackLoopAdapter` behind the same interface).
2. AstrBot is messaging/IM only. Never a second Goals/Use brain.
3. Nango only via `AuthConnector`. Never put OAuth tokens in prompts or frontend payloads.
4. Harness/AstrBot/Nango/TencentDB/LLM clients live under `adapters/`. Routers stay thin.
5. Mock mode must work with no API keys (daily demo).
6. Do not remove AstrBot or Nango from Compose to “simplify”.

## Workflow

1. One task from [DEV2-TASKS.md](DEV2-TASKS.md).
2. Tests/verify commands in that task.
3. Capture a visible demo (URL, JSON, screenshot).
4. Then start the next task.

## Local

```powershell
cd backend
.\scripts\dev.ps1
# API: http://localhost:8000/docs
docker compose up -d postgres nango memory agent-harness astrbot
```

Branch: `dev2/harness-astrbot-nango`. Commits: `feat(harness)`, `feat(astrbot)`, `feat(nango)`, `feat(mcp)`, `feat(memory)`, `feat(llm)`.
