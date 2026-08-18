# Weeple AI OS Dashboard

A dependency-free, hash-routed personal AI OS shell with modular pages.

## Run locally

Page fragments load dynamically, so the app must be served over HTTP (opening `index.html` via `file://` is not supported).

```powershell
npx serve .
```

Then open the printed local URL (for example `http://localhost:3000`).

## Routes

| Hash | Page |
|------|------|
| `#/overview` | Overview (topology + calendar) |
| `#/goals` | Goals |
| `#/import-data` | Import Data |
| `#/use-data` | Use Data |

## Project layout

```
index.html                 Shared shell (topbar, outlet, toast, activity dock)
src/app/                   Router, routes registry, bootstrap
src/shared/                Tokens, shell styles, store, storage, UI helpers
src/pages/<page>/          view.html + page.css + page.js per page
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for ownership and Git workflow.
