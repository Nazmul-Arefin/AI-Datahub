# DEV1 — Core platform + frontend maintainer

You are **Developer 1**. Team plan: [plan.md](../../plan.md).

**Backend owns:** auth, goals, tasks, overview, catalog/connect APIs, Postgres models/migrations, seed catalog.

**Frontend owns:** `frontend/src/pages/overview`, `goals`, `import-data`, shared API/repository wiring.

**Owns:** auth, goals, tasks, overview, calendar, integrations catalog/connect **HTTP surface**, Postgres models/migrations for catalog + connections + sources, seed catalog entries matching Import UI filters.

1. Page work stays in `frontend/src/pages/<page>/`.
2. Backend calls go through `frontend/src/shared/js/api/` and `repositories/` — not inline in page modules.
3. Do not implement Nango/AstrBot/Harness adapters; call `AuthConnector` / `MessagingService` / `MCPService`.
4. Coordinate shared schema changes with Dev2 (morning rebase). Branch: `dev1/goals-catalog`.

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

API base is already set in `frontend/index.html`:

```html
<script>window.__WEEple_API__ = 'http://localhost:8000/api/v1';</script>
```

With Postgres:

```powershell
docker compose up postgres api
cd backend
python -m alembic upgrade head
python scripts/seed_db.py
python scripts/smoke_vertical_slice.py
```

No Docker? Persistence also runs on SQLite — set
`DATABASE_URL=sqlite+pysqlite:///./weeple.db` alongside `USE_DATABASE=true`.
See `backend/README.md` for the full workflow.

## Wiring checklist (per page)

- [x] Replace mock array reads with repository `load()` (Import sources, Overview activity, Goals list)
- [x] Replace localStorage-only writes with API PATCH where a goal/source id exists
- [x] Connect wizard offers live catalog rows (`loadCatalogFromApi`) instead of a fixed key per tile
- [x] Goal create/delete and progress/monitoring changes go through the API when reachable
- [x] Keep UI-only prefs in `storage.js` (hints, layout) — layout stays local; source `aiEnabled` and goal progress go through the API

See `docs/api-contracts.md` for shapes.
