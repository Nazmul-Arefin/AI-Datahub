# Frontend — Weeple AI OS Dashboard

Hash-routed, dependency-free dashboard shell. Page fragments load via `fetch`, so serve over HTTP (not `file://`).

## Run

From the **repository root**:

```powershell
npx serve frontend
```

Or from this folder:

```powershell
npx serve .
```

Open the printed URL (for example `http://localhost:3000`).

## Optional: connect to backend API

Add before `bootstrap.js` in `index.html`:

```html
<script>window.__WEEple_API__ = 'http://localhost:8000/api/v1';</script>
```

API client: `src/shared/js/api/` · repositories: `src/shared/js/repositories/`

## Layout

```
index.html              Shell (topbar, outlet, toast, activity dock)
src/app/                Router, bootstrap, routes
src/shared/             Styles, store, runtime, API layer
src/pages/<page>/       view.html + page.css + page.js
assets/                 Images and logos
tools/                  Build scripts (monolith → modular)
```

## Routes

| Hash | Page |
|------|------|
| `#/overview` | Overview |
| `#/goals` | Goals |
| `#/import-data` | Import Data |
| `#/use-data` | Use Data |

## Build tools

```powershell
node tools/build-runtime.mjs    # Regenerate app-runtime.js from app.monolith.js
node tools/build-shell-css.mjs  # Split monolith CSS into page bundles
```
