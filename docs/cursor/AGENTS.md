# Agent instructions (Weeple monorepo)

## Repository map

- **Frontend:** `frontend/` (`index.html`, `src/`, `assets/`)
- **Backend:** `backend/app/`
- **Contracts:** `backend/app/schemas/` + `docs/api-contracts.md`

## Rules

1. Do not break hash routes: `#/overview`, `#/goals`, `#/import-data`, `#/use-data`.
2. Page-owned UI stays under `frontend/src/pages/<page>/`.
3. API integration uses `frontend/src/shared/js/api/client.js` — never hardcode fetch URLs in page CSS.
4. Backend route handlers stay thin; logic belongs in `services/`.
5. Shared JSON field names use camelCase aliases for frontend compatibility.
6. Adapters wrap third-party systems; never import Nango/MCP clients from `api/` directly.

## Commands

```powershell
npx serve frontend
cd backend && .\scripts\dev.ps1
cd backend && pytest
```

## When adding an endpoint

1. Schema in `backend/app/schemas/`
2. Service method in `backend/app/services/`
3. Route in `backend/app/api/`
4. Document in `docs/api-contracts.md`
5. Optional client in `frontend/src/shared/js/api/`
