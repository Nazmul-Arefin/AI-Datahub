# Weeple AI Datahub

A dependency-free, hash-routed personal AI dashboard. The four product pages are separated so two contributors can work without repeatedly editing the same HTML, CSS, and JavaScript files.

## Run locally

The application loads page fragments with `fetch`, so it must be served over HTTP rather than opened directly from the filesystem.

```powershell
npx serve .
```

Open the URL printed by the server. Available routes are:

- `#/overview`
- `#/goals`
- `#/import-data`
- `#/use-memory`

Run the dependency-free structural and JavaScript checks with:

```powershell
node scripts/check.mjs
```

## Project layout

```text
src/
  app/                 Router, route registry, and bootstrap
  pages/
    overview/          Overview-owned HTML, CSS, and JavaScript
    goals/             Goals-owned HTML, CSS, and JavaScript
    import-data/       Import Data-owned HTML, CSS, and JavaScript
    use-memory/        Use Memory-owned HTML, CSS, and JavaScript
  shared/              Shared shell, storage, UI, and compatibility styles/runtime
assets/                Shared images
```

Every page module exports `mount(context)` and `unmount()`. Add new page-specific work to that page's folder. Coordinate changes to `src/app` and `src/shared` with the other contributor.

The existing monolithic behavior and styling are temporarily retained in `src/shared/js/legacy-runtime.js` and `src/shared/styles/legacy.css` to preserve visual and interaction parity. Move rules and behavior out of those compatibility files in small, page-specific pull requests rather than rewriting them during unrelated feature work.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch and pull-request workflow.
