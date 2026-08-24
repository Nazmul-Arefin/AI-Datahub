# Weeple — Personal AI OS

Weeple (this repo is also called **AI Data Hub**) is a self-hosted personal AI operating system. It connects your goals, imported data sources, long-term memory, and a tool-using agent into one dashboard.

The product is a **single-user** system: one person, one machine, four screens. Collaboration and multi-tenant features are out of scope.

```
  You  →  Dashboard  →  FastAPI  →  Agent (DeepSeek Harness)
                              ↘  Catalog / OAuth (Nango + MCP)
                              ↘  Messaging (AstrBot)
                              ↘  Memory (TencentDB Agent Memory)
                              ↘  Postgres (app state)
```

---

## What it does

| Screen | Hash | Purpose |
|--------|------|---------|
| **Overview** | `#/overview` | 3D topology of goals, data, and memory plus a swipeable YOU + AI calendar |
| **Goals** | `#/goals` | Create and run personal goals; Coze generates a cover image in the background |
| **Import Data** | `#/import-data` | Search connectors, connect sources (Nango OAuth, AstrBot IM, WeChat/Gmail, Feishu, Google Calendar) |
| **Use Data** | `#/use-data` | Ask the agent to act on your connected data; live plans, progress, and reports via DeepSeek Harness |

Supporting capabilities:

- Sign in / create account (JWT). Default local admin is `admin` / `weeple`.
- Catalog search across hundreds of connectors; connect in a few clicks when Nango is live.
- Agent runs always go **API → AgentService → DeepSeek Harness**. AstrBot is messaging only — not a second brain.
- Goal cover artwork via **Coze CN** workflow when `COZE_MODE=live` and a token is set.

---

## Repository layout

```
frontend/                 Hash-routed vanilla SPA (no bundler required)
backend/                  FastAPI app, adapters, Alembic, tests
  app/api/                Thin HTTP routers
  app/services/           Business logic
  app/adapters/           Harness, AstrBot, Nango, MCP, LLM, Coze
  app/schemas/            Pydantic contracts (camelCase JSON)
  sidecars/               Harness + MCP gateway images
docs/                     Architecture, API contracts, licenses, Cursor guides
tools/wechat-personal-bridge/   Optional local WeChat personal-account bridge
docker-compose.yml        Postgres, API, Nango, Harness, AstrBot, MCP, memory
plan.md                   5-day vertical-slice plan
```

---

## Architecture (short)

| Piece | Role | Typical host port |
|-------|------|-------------------|
| Frontend | Dashboard | 3000 |
| FastAPI | App API `/api/v1` | 8000 |
| PostgreSQL | Goals, sources, tasks, catalog | 5432 |
| DeepSeek Harness | Primary agent runtime | 3080 |
| AstrBot | Telegram / Discord / China IM | 6185 |
| Nango | OAuth + API connectors | 3003, 3009 |
| MCP gateway | Catalog / register / invoke | 8080 |
| TencentDB Agent Memory | Long-term facts (optional profile) | 8420 |
| DeepSeek chat API | Shared LLM (cloud) | `api.deepseek.com` |

Hard rule: **Harness owns Goals / Use Data reasoning. AstrBot owns chat platforms. Nango+MCP own scale of integrations.**

Request flow (simplified):

```
UI  →  FastAPI
        ├─ Auth / Goals / Tasks / Overview     (app DB)
        ├─ Sources / Integrations / Search     (catalog + Nango)
        ├─ Agents                              → Harness → LLM + tools
        ├─ Memories                            → Memory sidecar
        └─ Messaging                           → AstrBot
```

Details: [docs/architecture.md](docs/architecture.md) · [docs/api-contracts.md](docs/api-contracts.md) · [docs/licenses.md](docs/licenses.md)

---

## Prerequisites

- **Python 3.11+** (3.12 recommended; Anaconda 3.9 is too old for SQLAlchemy 2)
- **Node.js** (only for `npx serve` and optional sidecar builds)
- **Docker Desktop** if you want the full sidecar stack
- A **DeepSeek API key** for live agent / LLM
- Optional: Coze PAT, Nango encryption key, Telegram bot token, Feishu / Gmail / WeChat credentials

On Windows, prefer **`http://127.0.0.1`** over `localhost` if IPv6 (`::1`) binds a different process.

---

## Quick start (local, no Docker)

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
copy .env.example .env
# Edit .env: JWT_SECRET, DEEPSEEK_API_KEY, optional COZE_API_TOKEN
$env:PYTHONPATH = (Get-Location).Path
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or run `backend\scripts\dev.cmd`.

| URL | |
|-----|--|
| OpenAPI | http://127.0.0.1:8000/docs |
| Health | http://127.0.0.1:8000/api/v1/health |
| Root | http://127.0.0.1:8000/ |

Default persistence is **in-memory** (`USE_DATABASE=false`). Restarts wipe goals/tasks. For SQLite:

```powershell
$env:USE_DATABASE = "true"
$env:DATABASE_URL = "sqlite+pysqlite:///./weeple.db"
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe scripts\seed_db.py
```

### 2. Frontend

From the **repo root** (not `backend/`):

```powershell
npx serve frontend -l 3000
```

Or double-click `frontend\dev.cmd`.

Open **http://127.0.0.1:3000/#/overview**.

The UI talks to `http://127.0.0.1:8000/api/v1` (`window.__WEEPLE_API__` in `frontend/index.html`). If the API is down, repositories fall back to in-browser mocks.

If you see a folder listing (`backend/`, `docs/`), port 3000 is serving the repo root. Stop that process and serve `frontend/` only.

### 3. Sign in

Create an account on the auth gate, or use **admin** / **weeple** (overridable via `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env`).

---

## Full stack (Docker)

```powershell
# From repo root. Secrets come from backend/.env
docker compose --env-file backend/.env up -d --build
```

Useful pieces:

```powershell
docker compose up -d postgres          # app database only
docker compose --profile owned-memory up -d   # TencentDB memory core + hub
```

Adminer (if enabled in compose): http://localhost:8088  
Nango Connect UI: http://localhost:3009  
AstrBot dashboard: http://localhost:6185  
Harness: http://localhost:3080

Smoke sidecars:

```powershell
cd backend
$env:PYTHONPATH = (Get-Location).Path
.\.venv\Scripts\python.exe scripts\ping_real_sidecars.py
```

More: [docs/cursor/LOCAL-STACK.md](docs/cursor/LOCAL-STACK.md)

---

## Environment (backend)

Copy `backend/.env.example` → `backend/.env`. **Never commit tokens.**

| Variable | Purpose |
|----------|---------|
| `API_PREFIX` | Default `/api/v1` |
| `CORS_ORIGINS` | Frontend origins |
| `USE_DATABASE` | `false` = memory store; `true` = SQLAlchemy + Alembic |
| `DATABASE_URL` | Postgres or SQLite |
| `JWT_SECRET` | Required in production (32+ chars) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Local admin shortcut |
| `DEEPSEEK_API_KEY` | Live LLM + Harness |
| `HARNESS_MODE` / `ASTRBOT_MODE` / `NANGO_MODE` / `MEMORY_MODE` | `mock` or `live` |
| `COZE_API_TOKEN` / `COZE_MODE` | Goal cover generation (`live` needs a PAT) |
| `NANGO_ENCRYPTION_KEY` | Required for Nango Connect UI |
| `TELEGRAM_BOT_TOKEN` | Live Telegram via AstrBot |

Coze covers: creating a goal returns `imageStatus=generating`, then `imageUrl` + `ready` when the workflow yields an image. Prompt style is modern product-editorial (see `backend/app/adapters/coze_workflow/client.py`).

---

## API surface

Base: **`/api/v1`**. JSON is **camelCase**. Errors:

```json
{ "error": { "code": "not_found", "message": "Goal not found", "details": {} } }
```

| Area | Prefix |
|------|--------|
| Health / sidecar / LLM ping | `/health` |
| Auth | `/auth` |
| Goals | `/goals` |
| Tasks | `/tasks` |
| Overview (calendar + activity) | `/overview` |
| Sources | `/sources` |
| Integrations catalog | `/integrations` |
| Search | `/search` |
| Settings | `/settings` |
| Memories | `/memories` |
| Agents / runs | `/agents` |
| MCP | `/mcp` |
| Messaging | `/messaging` |

Full shapes: [docs/api-contracts.md](docs/api-contracts.md).

---

## Tests

```powershell
cd backend
$env:PYTHONPATH = (Get-Location).Path
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe scripts\smoke_vertical_slice.py
```

`tests/test_database_mode.py` runs Alembic against a throwaway SQLite file so persistence is covered without Docker.

Frontend: serve the SPA and click through Overview (calendar swipe + topology), Goals (create + cover), Import Data (catalog), Use Data (mission).

---

## Optional: WeChat personal bridge

`tools/wechat-personal-bridge/` is a **local** helper (not a cloud WeChat API). See that folder’s README and `docs/cursor/report/wechat-personal-connect.md`. Gmail via Nango: `docs/cursor/report/gmail-nango-setup.md`.

---

## Team notes

Two backend tracks historically:

| Role | Owns |
|------|------|
| Dev1 | Auth, goals, tasks, overview, catalog HTTP, Postgres |
| Dev2 | Harness, AstrBot, Nango, MCP, memory, Compose sidecars |

- Product agents: `API → AgentService → DeepSeek Harness` only.
- Do not vendor AstrBot into the FastAPI image (**AGPL-3.0** sidecar).
- Nango is **Elastic License** — isolate as a sidecar.
- Conventional commits: `feat(goals)`, `feat(harness)`, `feat(astrbot)`, `feat(nango)`, `feat(mcp)`.

See [CONTRIBUTING.md](CONTRIBUTING.md), [plan.md](plan.md), [docs/cursor/DEV1.md](docs/cursor/DEV1.md), [docs/cursor/DEV2.md](docs/cursor/DEV2.md).

---

## License / packaging

Application code in this repo is intern/team project software. Third-party sidecars have their own licenses — read [docs/licenses.md](docs/licenses.md) before redistributing Docker images. Legal sign-off is required before shipping commercial images that include AstrBot or Nango.
