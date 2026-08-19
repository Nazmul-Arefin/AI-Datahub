# Final stack audit — Developer 2

**When:** 2026-08-19 (retest after AstrBot JWT + Nango DB reset)  
**Owner:** Developer 2 (AI + sidecars)  
**Verdict:** Dev2 sprint **T0–T9 is complete**. Live Compose board is **ok**. pytest **48 passed**. Remaining work is Dev1, GitHub OAuth in Nango, and a few operational items listed at the end.

---

## Sprint tasks

| Task | Status |
|------|--------|
| T0 Plan + Cursor rules | Done |
| T1 Sidecar health | Done |
| T2 Adapter interfaces + mock | Done |
| T3 LLM ping (deepseek-v4-pro) | Done — live ping ok |
| T4 Memory store/recall | Done — live store/get/404 ok |
| Real stack (Compose sidecars) | Running |
| T5 Nango Connect URL | Done — live Connect UI URL after secret restore |
| T6 MCP register + invoke stub | Done — live register + `list_repos` |
| T7 ContextBuilder → Harness | Done — live run completed |
| T8 AstrBot Telegram | Done — live connect + Telegram send (message id 7) |
| T9 Bulk MCP + vertical-slice smoke | Done (earlier this sprint) |

**Not Dev2 / out of sprint:** Auth, goals, tasks, overview, catalog seed, Postgres models (Dev1). 900 live Nango providers. RAG. AstrBot as Goals/Use brain (do not do).

---

## Live retest (this session)

| Surface | Result |
|---------|--------|
| `GET /api/v1/health` | 200 `ok` |
| `GET /api/v1/health/sidecars` | 200 overall `ok` — nango, memory, harness, astrbot, mcp_gateway |
| `GET /api/v1/health/llm` | 200 `mode: live`, `deepseek-v4-pro` |
| Direct `:3003` `:3009` `:3080` `:6185` `:8080` `:8420` `:8125` | HTTP 200 |
| `POST /integrations/connect` `{github}` | 200, `http://localhost:3009/?session_token=…` (no OAuth token in body) |
| `POST /mcp/register` | 200 `mode: live` |
| `POST /mcp/invoke` `list_repos` | 200 `ok: true` (stub, no secrets) |
| `send_message` without confirm | 200 `confirmation_required` |
| `send_message` with `confirm: true` | 200 `ok: true` `{delivered: true}` |
| `POST /memories` + GET by id | 200 live; missing id **404** |
| `POST /agents/runs` | 200 live Harness `sessionId`; GET later **completed** |
| Missing agent run | **404** |
| `POST /messaging/telegram/connect` | 200 **Telegram connected (live)** |
| `POST /messaging/messages` `threadId=7864065250` | 200 Telegram message id **7** |
| `GET /mcp/audit` | 200 `sink: sidecar` |
| pytest (host, mock via conftest) | **48 passed** |

Architecture still holds: **API → AgentService → DeepSeek Harness**. AstrBot is messaging only.

---

## Bugs B1–B10

All previously reproduced bugs are **fixed** and still look correct on this retest (memory 200/404, unknown run 404, audit sink sidecar, AstrBot health 200, JWT dashboard auth 200 from API container).

---

## Issues found and handled today

1. **Nango `:3003` down** — `NANGO_ENCRYPTION_KEY` had been removed. Generated a new key, wiped `ai-datahub_nango_db_data`, restarted Nango. **Keep this key in `backend/.env`.**
2. **Nango Connect fell back to a docker-internal URL** — `NANGO_SECRET_KEY` was missing after the DB wipe. Restored via `python scripts/bootstrap_nango_secret.py` and recreated the API. Connect URL is again `localhost:3009`.
3. **AstrBot dashboard JWT** — valid (AstrBot `/api/config/get` 200). API container has it after recreate. JWT lasts ~7 days; refresh from WebUI Local Storage `token` if dashboard calls start 401.
4. **`backend/.env.example` had a real JWT** — cleared. Do not commit secrets.

---

## Known gaps (not sprint blockers)

| Gap | Notes |
|-----|--------|
| Host `backend/.env` still has old mock ports (`8081`–`8083`) and `*_MODE=mock` | Compose **overrides** these for the API container. Only matters if you run uvicorn on the host without Compose env. |
| Duplicate `DEEPSEEK_API_KEY` line (one has a leading space) | Compose uses the later unspaced line. Clean it when you next edit `.env`. |
| MCP `invoke` is a **stub** (`list_repos` / confirm-gated `send_message`) | T6 by design — not live GitHub API. |
| Nango GitHub OAuth | Connect URL works. Completing GitHub login still needs a GitHub OAuth app in Nango Integrations (`http://localhost:3003`). Previous Nango connections were wiped with the DB. |
| Dev1 surfaces | Goals/tasks/overview/auth still mock JSON; Postgres models not Dev2. |
| Git push | Branch `dev2/harness-astrbot-nango` may still lack write access to `Nazmul-Arefin/AI-Datahub`. |

---

## What I need from you

1. **Leave Computer Access on Disallow** in AstrBot (already set).
2. **Do not delete `NANGO_ENCRYPTION_KEY`** from `.env`. If Nango dies again with “encryption key has been removed”, the DB must be reset.
3. If you want real GitHub OAuth: in Nango dashboard create a GitHub integration with client id/secret, then open the Connect URL from `POST /integrations/connect`.
4. After ~7 days, paste a fresh AstrBot Local Storage `token` into `ASTRBOT_DASHBOARD_TOKEN` and recreate the API container.
5. Recreate the API whenever you change `.env`:  
   `docker compose --env-file backend/.env up -d api --force-recreate`
6. **Never commit `.env`.** Telegram token, DeepSeek key, Nango keys, and the dashboard JWT stay local.
7. Dev1 still owns auth/goals/catalog/Postgres — nothing for you to finish on that side for this sprint.

No further Dev2 sprint task is open. Optional next steps are GitHub OAuth in Nango, pushing the branch when you have write access, and letting Dev1 take the product CRUD/auth work.
