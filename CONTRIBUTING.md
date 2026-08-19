# Contributing

Two backend developers. Canonical plan: [plan.md](plan.md).

| Role | Owns | Branch |
|------|------|--------|
| **Dev1** | Auth, goals, tasks, overview, catalog/connect HTTP, Postgres models | `dev1/goals-catalog` |
| **Dev2** | Harness, AstrBot, Nango, MCP gateway, Memory, LLM, Compose sidecars | `dev2/harness-astrbot-nango` |

Guides: [docs/cursor/DEV1.md](docs/cursor/DEV1.md), [docs/cursor/DEV2.md](docs/cursor/DEV2.md), [docs/cursor/AGENTS.md](docs/cursor/AGENTS.md).

## Workflow

1. Rebase onto latest `main` each morning. No force-push to `main`.
2. `backend/app/schemas/` has a **day-owner** — coordinate before editing shared contracts.
3. One task at a time (Dev2: [docs/cursor/DEV2-TASKS.md](docs/cursor/DEV2-TASKS.md)). Test before starting the next.
4. Conventional commits: `feat(catalog)`, `feat(harness)`, `feat(astrbot)`, `feat(nango)`, `feat(mcp)`.

## Isolation

- Routers stay thin; SDKs live in `backend/app/adapters/`.
- Product agents go `API → AgentService → DeepSeek Harness`.
- AstrBot is messaging only.
- Do not add collaboration endpoints.

## Commands

```powershell
npx serve frontend
cd backend
.\scripts\dev.ps1
pytest
```

## Line endings

`.gitattributes` normalizes text files to LF so Windows/macOS edits do not create noise-only conflicts.
