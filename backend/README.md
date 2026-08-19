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
pytest
python scripts/smoke_vertical_slice.py
```

With Postgres (`USE_DATABASE=true`):

```powershell
docker compose up postgres -d
alembic upgrade head
python scripts/seed_db.py

