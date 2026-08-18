# Contributing

## Page ownership

| Folder | Owner |
|--------|--------|
| `src/pages/overview` | Primary maintainer |
| `src/pages/goals` | Primary maintainer |
| `src/pages/import-data` | Primary maintainer |
| `src/pages/use-data` | Teammate |

Keep routine feature work inside your page folder (`view.html`, `page.css`, `page.js`).

## Shared code

Changes under `src/shared/` or `src/app/routes.js` affect every page. Prefer a **separate PR** and coordinate with the other maintainer before merging.

The route registry in `src/app/routes.js` is defined up front — do not edit it for normal page work.

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
# Serve the app (required — no file://)
npx serve .

# Syntax-check modules
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Line endings

`.gitattributes` normalizes text files to LF so Windows/macOS edits do not create noise-only conflicts.
