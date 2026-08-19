# Weeple Backend

FastAPI service for the Weeple AI OS dashboard. Contracts live in `app/schemas/` and `../docs/api-contracts.md`.

## Quick start

```powershell
cd backend
python -m venv .venv
copy .env.example .env
$env:PYTHONPATH = (Get-Location).Path
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or run `.\scripts\dev.cmd`.

- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/api/v1/health
- Alias: http://127.0.0.1:8000/health

## Layout

```
app/
  main.py           FastAPI app + CORS
  api/              Route handlers (thin)
  schemas/          Pydantic contracts (shared with frontend)
  services/         Business logic
  models/           SQLAlchemy models (when USE_DATABASE=true)
  adapters/         External systems (Nango, MCP, LLM, memory)
  core/             Config, deps, logging
workers/            Background jobs (future)
alembic/            Migrations
tests/              pytest
scripts/            Dev helpers
```

## Tests

```powershell
$env:PYTHONPATH = (Get-Location).Path
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe scripts\smoke_vertical_slice.py
```

`tests/test_database_mode.py` runs the real Alembic migration against a
throwaway SQLite database, so persistence is covered without Docker.

## Persistence modes

`USE_DATABASE=false` (default) keeps goals, sources, and activity in
`services/runtime_store.py`. Nothing survives a restart and no migration is
needed — this is what tests and the local demo use.

`USE_DATABASE=true` routes the same service code through SQLAlchemy. Run the
migration first, or requests will fail on missing tables.

### SQLite (no Docker required)

```powershell
$env:PYTHONPATH = (Get-Location).Path
$env:USE_DATABASE = "true"
$env:DATABASE_URL = "sqlite+pysqlite:///./weeple.db"
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe scripts\seed_db.py
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### Postgres

```powershell
docker compose up postgres -d
$env:USE_DATABASE = "true"
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe scripts\seed_db.py
```

Point Alembic at a different database without editing `.env`:

```powershell
.\.venv\Scripts\python.exe -m alembic -x db_url="sqlite+pysqlite:///./scratch.db" upgrade head
```

`scripts/seed_db.py` is idempotent, so re-running it will not duplicate rows.

