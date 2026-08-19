# Agent instructions — AI Data Hub backend

Monorepo: `frontend/` (V2.3.2 mock SPA) + `backend/` (FastAPI modular monolith) + sidecars in Compose.

Read first: [plan.md](../../plan.md), [api-contracts.md](../api-contracts.md), [licenses.md](../licenses.md), `backend/app/schemas/`.

This checkout’s active developer is **Developer 2**. Follow [TODO.md](TODO.md) (live status), [DEV2.md](DEV2.md), and [DEV2-TASKS.md](DEV2-TASKS.md).

## Locked split

| Who | Owns |
|-----|------|
| Dev1 | Auth, goals, tasks, overview, catalog/connect HTTP, Postgres models |
| Dev2 | Adapters + AgentService, MessagingService, AuthConnector, MCP, Memory, LLM, Compose sidecars |

## Isolation (non-negotiable)

- Product agents: `API → AgentService → DeepSeek Harness` (FallbackLoopAdapter allowed, same interface).
- AstrBot: messaging/IM connectors only. Never implement Goals/Use agent loop there.
- Nango: OAuth/API-key scale layer via `AuthConnector` only.
- Routers never import Harness / AstrBot / Nango / TencentDB / DeepSeek clients.
- Never put OAuth tokens in agent prompts or frontend payloads.
- Adding a connector = catalog/registry data, not a new business router.
- Do not remove AstrBot or Nango from Compose without updating docs and the boss-facing architecture.
- No collaboration endpoints.

## Commands

```powershell
npx serve frontend
cd backend; .\scripts\dev.ps1
cd backend; pytest
docker compose up -d
```

## Adding an endpoint

1. Schema in `backend/app/schemas/` (check day-owner).
2. Logic in `backend/app/services/` (or adapter behind the service).
3. Thin route in `backend/app/api/`.
4. Document in `docs/api-contracts.md`.

## Git

- Branches: `dev1/goals-catalog`, `dev2/harness-astrbot-nango`.
- Morning rebase; no force-push to `main`.
- Conventional commits with scopes: `feat(catalog)`, `feat(harness)`, `feat(astrbot)`, `feat(nango)`, `feat(mcp)`.
