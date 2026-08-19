# DEV1 — Core platform + catalog UX APIs

You are **Developer 1**. Team plan: [plan.md](../../plan.md).

**Owns:** auth, goals, tasks, overview, calendar, integrations catalog/connect **HTTP surface**, Postgres models/migrations for catalog + connections + sources, seed catalog entries matching Import UI filters.

**Does not own:** Nango / AstrBot / Harness / TencentDB SDKs. Call `AuthConnector`, `MessagingService`, and `MCPService` interfaces (Dev2).

## Path allowlist (edit these)

```text
backend/app/models/**
backend/alembic/**
backend/app/api/auth.py
backend/app/api/goals.py
backend/app/api/tasks.py
backend/app/api/sources.py
backend/app/api/overview.py
backend/app/api/integrations.py
backend/app/services/goal_service.py
backend/app/services/task_service.py
backend/app/services/source_service.py
backend/app/services/overview_service.py
backend/app/services/seed_data.py
backend/app/schemas/          # day-owner; morning rebase
```

## Do not edit (Dev2)

```text
backend/app/adapters/**
backend/app/services/agent_service.py
backend/app/services/messaging_service.py
backend/app/services/memory_service.py
backend/app/services/mcp_service.py
backend/app/services/auth_connector.py
backend/app/services/context_builder.py
docker-compose.yml sidecar images (harness, astrbot, nango, memory)
```

## Hard rules

1. Integrations connect API calls `AuthConnector` — do not import Nango clients in routers.
2. Catalog is data-driven. Do not add a new FastAPI router per connector.
3. UUID ids; plural `/api/v1/...`; errors `{ "error": { "code", "message", "details" } }`.
4. No collaboration endpoints.
5. Prototype UI layouts are not hard DB constraints.

## Local

```powershell
cd backend
.\scripts\dev.ps1
```

Branch: `dev1/goals-catalog`. Commits: `feat(catalog)`, `feat(goals)`, `feat(auth)`, `feat(overview)`.
