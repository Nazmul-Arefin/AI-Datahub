# Weeple Backend

FastAPI service for the Weeple AI OS dashboard. Contracts live in `app/schemas/` and `../docs/api-contracts.md`.

This checkout is **Developer 2** (AI + sidecars). See `../docs/cursor/DEV2.md` and `../docs/cursor/DEV2-TASKS.md`. Team plan: `../plan.md`.

## Quick start

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
copy .env.example .env
$env:PYTHONPATH = (Get-Location).Path
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

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
pytest
```
