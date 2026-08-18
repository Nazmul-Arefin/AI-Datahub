# DEV1 — Frontend maintainer

**Owns:** `frontend/src/pages/overview`, `goals`, `import-data`, shared shell integration.

## Workflow

1. Page work stays in `frontend/src/pages/<page>/`.
2. Backend calls go through `frontend/src/shared/js/api/` and `repositories/` — not inline in page modules.
3. Coordinate shared changes (`frontend/src/shared/`, `frontend/index.html`) in separate PRs.

## Local dev

```powershell
# Terminal 1 — UI
npx serve frontend

# Terminal 2 — API
cd backend
.\scripts\dev.ps1
```

Set API base in `frontend/index.html`:

```html
<script>window.__WEEple_API__ = 'http://localhost:8000/api/v1';</script>
```

## Wiring checklist (per page)

- [ ] Replace mock array reads with repository `load()`
- [ ] Replace localStorage writes with repository `save()` + API PATCH
- [ ] Keep UI-only prefs in `storage.js` (hints, layout)

See `docs/api-contracts.md` for shapes.
