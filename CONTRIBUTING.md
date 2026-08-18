# Contributing

## Page ownership

| Folder | Owner |
|--------|--------|
| `frontend/src/pages/overview` | Primary maintainer |
| `frontend/src/pages/goals` | Primary maintainer |
| `frontend/src/pages/import-data` | Primary maintainer |
| `frontend/src/pages/use-data` | Teammate |

Keep routine feature work inside your page folder (`view.html`, `page.css`, `page.js`).

## Shared code

Changes under `frontend/src/shared/` or `frontend/src/app/routes.js` affect every page. Prefer a **separate PR** and coordinate with the other maintainer before merging.

The route registry in `frontend/src/app/routes.js` is defined up front — do not edit it for normal page work.

## Branch workflow

1. Update local `main` (pull/rebase) before starting.
2. Create a fresh branch per task, for example:
   - `feature/goals-progress`
   - `feature/use-data-search`
3. Limit the PR diff to the relevant page folder when possible.
4. Require the other teammate to review before merge.
5. Delete the feature branch after merge; start the next task from latest `main`.

## Useful commands

```powershell
# Serve the UI (required — no file://)
npx serve frontend

# Syntax-check frontend modules
Get-ChildItem -Recurse frontend/src -Filter *.js | ForEach-Object { node --check $_.FullName }

# Backend API (optional)
cd backend
.\scripts\dev.ps1
pytest
```

## Backend

API lives in `backend/`. Contracts: `backend/app/schemas/` and `docs/api-contracts.md`.  
Do not call the API directly from page folders — use `frontend/src/shared/js/api/` and `repositories/`.

## Line endings

`.gitattributes` normalizes text files to LF so Windows/macOS edits do not create noise-only conflicts.
