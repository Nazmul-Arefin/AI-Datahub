# DEV1 — Core platform + frontend maintainer

**Backend owns:** auth, goals, tasks, overview, catalog/connect APIs, Postgres models/migrations, seed catalog.

**Frontend owns:** `frontend/src/pages/overview`, `goals`, `import-data`, shared API/repository wiring.

## Workflow

1. Page work stays in `frontend/src/pages/<page>/`.
2. Backend calls go through `frontend/src/shared/js/api/` and `repositories/` — not inline in page modules.
3. Do not implement Nango/AstrBot/Harness adapters; call `AuthConnector` / `MessagingService` / `MCPService`.
4. Coordinate shared schema changes with Dev2 (morning rebase). Branch: `dev1/goals-catalog`.

## Local dev

```powershell
# Terminal 1 — UI
npx serve frontend

# Terminal 2 — API
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
