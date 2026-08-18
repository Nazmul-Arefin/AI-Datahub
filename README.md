# Weeple AI OS

Monorepo: modular dashboard UI + FastAPI backend.

## Repository layout

```
frontend/          Hash-routed UI (index.html, src/, assets/)
backend/           FastAPI API (schemas, services, adapters)
docs/              Architecture, API contracts, dev guides
docker-compose.yml Local stack (Postgres + API + adapter placeholders)
```

## Run locally

### Frontend

```powershell
npx serve frontend
```

Open the printed URL (for example `http://localhost:3000`).

### Backend (optional — mock API)

```powershell
cd backend
.\scripts\dev.ps1
```

- API docs: http://localhost:8000/docs  
- Health: http://localhost:8000/api/v1/health

To point the UI at the API, add to `frontend/index.html` before bootstrap:

```html
<script>window.__WEEple_API__ = 'http://localhost:8000/api/v1';</script>
```

Repositories in `frontend/src/shared/js/repositories/` fall back to in-memory mocks when the API is unreachable.

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
