# Contributing

## Ownership

| Area | Primary owner | Files |
| --- | --- | --- |
| Overview | Project owner | `src/pages/overview/` |
| Goals | Project owner | `src/pages/goals/` |
| Import Data | Project owner | `src/pages/import-data/` |
| Use Memory | Teammate | `src/pages/use-memory/` |
| App shell and shared code | Coordinate first | `src/app/`, `src/shared/`, `index.html` |

Ownership identifies the normal editing boundary; both contributors can review every pull request.

## Branch workflow

1. Update local `main` before starting work.

   ```powershell
   git switch main
   git pull --ff-only origin main
   ```

2. Create a branch for one focused change.

   ```powershell
   git switch -c feature/goals-progress
   ```

3. Keep page work inside the owning page folder. Put necessary shared changes in a separate commit and call them out in the pull request.

4. Check the changed JavaScript and run the app locally.

   ```powershell
   node scripts/check.mjs
   npx serve .
   ```

5. Commit and push the feature branch.

   ```powershell
   git add src/pages/goals
   git commit -m "Describe the goal page change"
   git push -u origin feature/goals-progress
   ```

6. Open a pull request into `main`, request the other contributor's review, and merge only after the checks pass.

7. Delete the merged branch and begin the next task from the updated `main`.

## Bringing in the existing Use Memory copy

The teammate should commit their current standalone work without first replacing it with this refactor:

```powershell
git switch -c feature/use-memory
git add index.html app.js styles.css
git commit -m "Add Use Memory page work"
git push -u origin feature/use-memory
```

Merge that branch into `integration/modular-page-structure`. Resolve its `index.html`, `app.js`, and `styles.css` changes by transferring Use Memory markup to `src/pages/use-memory/view.html`, behavior to `src/pages/use-memory/page.js` (or temporarily to the compatibility runtime), and styling to `src/pages/use-memory/page.css` (or temporarily to the compatibility stylesheet). Do not replace the modular root `index.html` with the teammate's monolithic file.

## Pull-request checklist

- The intended hash route loads directly and after refresh.
- Top navigation, browser back, and browser forward work.
- The other three pages still open without console errors.
- Page listeners, timers, and animation frames are cleaned up in `unmount()` when added by a page module.
- New CSS is scoped under the page class, such as `.page--goals`.
- Changes to shared files are explained in the pull request.
