# Weeple AI OS / AI Data Hub

Monorepo: modular dashboard UI + FastAPI backend + sidecars.

**Backend sprint plan:** [plan.md](plan.md)  
**Developer 2 live todo:** [docs/cursor/TODO.md](docs/cursor/TODO.md)  
**Role + task details:** [docs/cursor/DEV2.md](docs/cursor/DEV2.md) · [docs/cursor/DEV2-TASKS.md](docs/cursor/DEV2-TASKS.md)

## Repository layout

```
frontend/          Hash-routed UI (index.html, src/, assets/)
backend/           FastAPI API (schemas, services, adapters)
docs/              Architecture, API contracts, cursor guides
docker-compose.yml api + postgres + harness + astrbot + nango + memory
```

## Run locally

### Backend

```powershell
cd backend
$env:PYTHONPATH = (Get-Location).Path
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or double-click / run `backend\scripts\dev.cmd` (avoids PowerShell script blocking).

- Root: http://127.0.0.1:8000/
- Docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/api/v1/health

Use **127.0.0.1**, not `localhost`, if Windows resolves `localhost` to IPv6 (`::1`) and you get a 404 from another process.

### Frontend

From the **repo root** (not `backend/`):

```powershell
npx serve frontend -l 3000
```

Or double-click `frontend\dev.cmd`.

Open the URL the command prints (usually `http://localhost:3000/#/overview`).

If the page is a folder listing (`backend/`, `docs/`, `.cursor/`), port 3000 is serving the **repo root** instead of `frontend/`. Stop that other `serve` process and use the URL printed by `npx serve frontend`.

The UI already points at `http://127.0.0.1:8000/api/v1`. Repositories fall back to in-memory mocks when the API is unreachable.

### Docker stack

```powershell
docker compose up postgres api
```

## Routes

| Hash | Page |
|------|------|
| `#/overview` | Overview (topology + calendar) |
| `#/goals` | Goals |
| `#/import-data` | Import Data |
| `#/use-data` | Use Data |

See [frontend/README.md](frontend/README.md), [CONTRIBUTING.md](CONTRIBUTING.md), [docs/architecture.md](docs/architecture.md), and [docs/api-contracts.md](docs/api-contracts.md).
