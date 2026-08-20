# Developer 1 work summary

**When:** 2026-08-19  
**Owner:** Developer 1 (core platform + catalog UX + frontend wiring)  
**Branch:** `dev1/goals-catalog` → merged to GitHub `main` as `211682e` and `76113f4`  
**Verdict:** Dev1 5-day scope is **done**. Goals, Import, and Overview read and write the real API. Connect/revoke persist. Catalog is data-driven and locked to Import filter chips.

Dev2 sidecar stack was merged on top of this as `3e5125e`. This report covers **Dev1 only**.

---

## Sprint map (plan.md Days 1–5)

| Day | Plan | Status |
|-----|------|--------|
| 1 | Auth, health, shared schemas, OpenAPI freeze, error contract | Done |
| 2 | Goals / tasks / sources CRUD + catalog list/search seed | Done — 5 goals, 12 sources, 14 catalog rows |
| 3 | Overview activity; Import connect → `AuthConnector`; nested connection on source cards | Done |
| 4 | `{ error: { code, message, details } }`; real revoke; catalog categories = UI chips; 3-step MCP add doc | Done |
| 5 | Smoke: catalog search → connect → sources → overview; frontend Goals/Import/Overview via API | Done |

Not Dev1: Harness, AstrBot, Nango SDKs, MCP gateway, TencentDB memory (Dev2).

---

## What shipped

### Backend

- **JWT admin auth** — `POST /auth/token`, `GET /auth/me`. Default `admin` / `weeple`. Unauthenticated local requests still map to `dev-user`.
- **Error envelope** — `{ "error": { "code", "message", "details" } }` for HTTP exceptions.
- **Postgres / SQLite** — Alembic `0001_initial_dev1`: `users`, `goals`, `tasks`, `sources`, `connections`, `catalog`, `oauth_states`, `activity_events`. Flag `USE_DATABASE=true` (Compose default). Tests run in-memory with `USE_DATABASE=false`.
- **Catalog** — `GET /integrations/catalog?q=&category=`. Categories: `device`, `files`, `productivity`, `health`, `communication`, `identity`. `authType`: `nango` | `astrbot` | `mcp_url` | `api_key`. Adding a connector is a seed row, not a new router (`docs/mcp-catalog.md`).
- **Connect** — `POST /integrations/connect` routes by `authType` through `AuthConnector` (Nango) or `MessagingService` (AstrBot). OAuth `state` is single-use. `GET /integrations/callback` persists connection + source; never returns tokens.
- **Revoke / reconnect** — `POST /sources/{id}/disconnect` sets `aiEnabled=false`, connection `revoked`, then `AuthConnector.revoke` + `MCPService.unregister` independently. Reconnect for `nango`/`astrbot` restarts OAuth; `api_key`/`mcp_url` re-enable locally.
- **Overview** — live goal/source counts; activity events on goal status change and connect.

### Frontend

- `window.__WEEple_API__` in `frontend/index.html`.
- Repositories in `frontend/src/shared/js/` for sources, goals, overview — pages do not call fetch inline.
- Import wizard loads **live catalog** (`loadCatalogFromApi`), not a hardcoded key per tile.
- Pause / revoke / reconnect, goal create/delete, progress PATCH after hydrate.
- Hydrate fixes: do not `Object.assign` API subgoals over `executionTasks`; source hydrate fetches `all` then filters locally.

### Commits on `main`

| SHA | What |
|-----|------|
| `211682e` | Serve Goals, Import, and Overview from the real API; JWT; error envelope; models + Alembic; `USE_DATABASE` |
| `76113f4` | Persist connect/revoke; Import Data uses live catalog |

---

## How we verified

- Backend pytest after Dev2 merge: **94 passed**, 2 skipped (live Harness / live Nango — Dev2 sidecars, not Dev1).
- Dev1 coverage includes: `test_auth.py`, `test_goals_crud.py`, `test_sources.py`, `test_catalog_search.py` (filter slugs vs Import chips), `test_connect_flow.py` (AuthConnector mocked), `test_overview.py`, `test_database_mode.py` (SQLite persist, idempotent seed, single-use OAuth state).
- Smoke: `python backend/scripts/smoke_vertical_slice.py` — login → `/me` → catalog search → connect → callback → sources include `github` → overview activity.

---

## Known gaps (not sprint blockers)

| Gap | Notes |
|-----|--------|
| Live GitHub OAuth | Catalog connect stores a credential **reference**. Completing GitHub login still needs a Nango OAuth app (Dev2). Mock callback `code=dev-ok` is what tests and smoke use. |
| Import grid vs catalog | `macbook`, `dashcam`, `research`, `identity` cards have **no** catalog key. Device wizard maps to `iphone`. |
| Dual store | In-memory `runtime_store` for tests; SQL when `USE_DATABASE=true`. Do not mix a long-lived uvicorn process with a later DB flip without restart. |

---

## Definition of done (checked)

- [x] Auth, goals, tasks, sources, catalog, overview HTTP surfaces
- [x] Seed catalog matches Import filter chips
- [x] Connect API does not import Nango clients in the router
- [x] Revoke is not a status-only flip
- [x] Frontend Goals / Import / Overview wired through repositories
- [x] Vertical-slice smoke for the Dev1 HTTP path
- [x] Merged to GitHub `main` (`Nazmul-Arefin/AI-Datahub`)
