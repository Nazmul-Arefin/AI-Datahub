# DEV2 — Use Data maintainer

**Owns:** `frontend/src/pages/use-data`.

## Workflow

1. Feature work in `frontend/src/pages/use-data/` (`view.html`, `page.css`, `page.js`).
2. Agent/mission APIs: `agents.py`, `memories.py`, `messaging.py`.
3. Review shared PRs that touch routing or shell.

## Local dev

Same as DEV1 — UI on `:3000` (`npx serve frontend`) and API on `:8000`.

## Integration targets

| UI area | Endpoint |
|---------|----------|
| Mission start | `POST /agents/runs` |
| Progress | `GET /agents/runs/{runId}` |
| Memory proposals | `GET /memories/proposals` |
| Chat stream | `POST /messaging/messages` (SSE/WebSocket TBD) |

Stub responses are implemented; replace with harness/AstrBot adapters in Phase 3.
