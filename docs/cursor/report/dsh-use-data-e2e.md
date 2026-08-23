# DeepSeek Harness (DSH) — end-to-end report

Date: 2026-08-21  
Stack: live Docker `ai-datahub` (v3.0 -Backend mount) + frontend `:3000`

## What works now

| Flow | Status |
| --- | --- |
| Use Data prompt → `POST /api/v1/agents/runs` → DeepSeek Harness | **Live** |
| Context includes goal + **synced_assets** (Gmail etc.) + memories + tools | **Live** |
| Poll `GET /agents/runs/{id}` until complete → **summary** in API | **Live** |
| Use Data Results panel + View details show agent summary | **Wired** |
| Goals confirmed suggestion → real agent run (not fake timer) | **Wired** |
| Overview activity shows “Agent run started/completed” + summary snippet | **Live** |

Verified API answer (grounded in synced Gmail):

> The newest actionable Gmail item in your synced data is the Taskade email …

## How to test (UI)

1. Hard-refresh Weeple: `Ctrl+Shift+R` on `http://localhost:3000`
2. Confirm API is up: `http://localhost:8000/api/v1/health`
3. Confirm harness: `http://localhost:3080` (container `ai-datahub-agent-harness-1`)
4. **Use Data**
   - Open **Use Data**
   - Type e.g. `What should I prioritize today from my synced Gmail?`
   - Send → wait for toast **DeepSeek answer ready**
   - Open **View details** → executive summary should be the live answer
5. **Overview**
   - Activity feed should show **Agent run started** / **Agent run completed** with a short detail
6. **Goals**
   - Confirm an AI suggestion → toast **AI is working** → completed with real `aiOutput` text

## API smoke (optional)

```powershell
$mission = @{ mission = "One sentence: newest actionable Gmail item?" } | ConvertTo-Json
$run = Invoke-RestMethod http://127.0.0.1:8000/api/v1/agents/runs -Method POST -Body $mission -ContentType application/json
do {
  Start-Sleep 2
  $poll = Invoke-RestMethod "http://127.0.0.1:8000/api/v1/agents/runs/$($run.runId)"
} while ($poll.status -notin @('completed','failed') -or -not $poll.summary)
$poll.summary
```

## Key files changed (live stack)

- `backend/app/services/context_builder.py` — goal + synced snippets in prompt
- `backend/app/services/agent_service.py` — load goal/synced_assets, activity, summary
- `backend/app/adapters/agent_harness/client.py` — parse assistant message text from DSH events
- `backend/app/schemas/agents.py` — expose `summary`
- `frontend/.../api/agents.js` + `repositories/agentsRepository.js`
- `frontend/.../app-runtime.js` — Use Data + Goals call live agent API

## Notes

- Dev API allows unauthenticated calls (`app_env=development`).
- Compose already sets `HARNESS_MODE=live` and `AGENT_HARNESS_URL=http://agent-harness:3080`.
- Answers quality depends on what you synced in Import Data (Gmail sync recommended before demos).
