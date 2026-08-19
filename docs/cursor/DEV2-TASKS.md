# Developer 2 — prioritized task board

**Role:** AI + sidecars (Harness, AstrBot, Nango, MCP gateway, Memory, LLM).  
**Branch:** `dev2/harness-astrbot-nango`  
**Live checklist (open this for status):** [TODO.md](TODO.md)  
**Daily reports + screenshots:** [report/README.md](report/README.md)  
**Team plan:** [plan.md](../../plan.md)  
**Allowlist:** [DEV2.md](DEV2.md)

Work **one task at a time**. Do not start the next task until the current one is tested and a demo artifact exists.

Legend: **P0** blocks the Day-5 demo or Dev1. **P1** is the AI vertical slice. **P2** is connect/MCP scale. **P3** is polish.

## Status

| Task | Priority | State |
|------|----------|--------|
| T0 Plan + Cursor rules in this repo | P0 | **Done** (2026-08-18) |
| T1 Sidecar Compose + health | P0 | **Done** (2026-08-18) |
| T2 Adapter interfaces + mock mode | P0 | **Done** (2026-08-18) |
| T3 LLMService ping | P1 | **Done** (2026-08-18) |
| T4 Memory store/recall | P1 | **Done** (2026-08-18) |
| T5 Nango mock connect URL | P0 | **Done** (2026-08-18, live Nango) |
| T6 MCP registry + invoke stub | P1 | **Done** (2026-08-19) |
| T7 ContextBuilder + Harness run | P0 | **Done** (2026-08-19) |
| T8 AstrBot one-platform connect | P1 | **Done** (2026-08-19) |
| T9 Bulk register + smoke | P2 | **Done** (2026-08-19) |

---

## What we skip (low importance / not ours)

| Item | Why skip now |
|------|----------------|
| Goals / tasks / overview CRUD, catalog seed, Postgres models | Dev1 |
| 900 live Nango providers | Pipeline only (T8) |
| RAG / Qdrant / LlamaIndex | Post-sprint stub |
| Collaboration / social APIs | Out of scope |
| Using AstrBot as Goals/Use brain | Hard rule |
| Production AGPL/Elastic packaging | Document only (`docs/licenses.md`) |
| Redesigning the four UI pages | Frontend mock is design contract only |
| Dedicated MCP process | In-process gateway for Day 5 |

---

## Priority order (why this sequence)

1. **Sidecar health (T1)** — without reachable sidecars, every adapter is fiction. First visible board for the team.
2. **Service interfaces + mock mode (T2)** — Dev1 must call `AuthConnector` / `MessagingService` / `MCPService` without waiting for real SDKs.
3. **LLM ping (T3)** — smallest real AI proof; Harness and AstrBot both consume `LLMService`.
4. **Memory store/recall (T4)** — required before a honest agent run.
5. **Nango connect URL (T5)** — Import “Connect” button; Dev1 wires the HTTP surface to this.
6. **MCP registry + invoke stub (T6)** — agents never see secrets; scale path starts here.
7. **ContextBuilder + Harness run (T7)** — the boss-facing AI story.
8. **AstrBot one-platform connect (T8)** — second boss component, messaging source.
9. **Bulk register + smoke (T9)** — proves “add MCP without new FastAPI code”; daily freeze demo.

---

## Task list

### T1 — Sidecar Compose + health (P0)  ✅ done

**Day:** 1  
**Goal:** Compose brings up postgres + mock/real sidecars that return JSON health. API reports sidecar status. No nginx placeholders for adapter ports.

**Implement:**

- Mock (or thin) HTTP health for: `harness`, `astrbot`, `nango` (or `nango-mock`), `memory`.
- `GET /api/v1/health` stays simple; add `GET /api/v1/health/sidecars` (or extend health) via adapters — **routers must not call sidecar URLs directly**.
- Env flags: `HARNESS_MODE`, `ASTRBOT_MODE`, `NANGO_MODE`, `MEMORY_MODE` = `mock` | `live`.

**Verify:**

```powershell
docker compose up -d postgres nango memory agent-harness astrbot
# then API locally or via compose
curl http://localhost:8000/api/v1/health
curl http://localhost:8000/api/v1/health/sidecars
pytest tests/test_health.py -q
```

**Demo (submit):** JSON from `/health/sidecars` showing each sidecar `ok` or `mock`. Screenshot of `/docs`.

**Verified (2026-08-18):** `pytest` 7 passed. Compose stack healthy.  
`GET http://localhost:8000/api/v1/health/sidecars` → `"status":"ok"` for nango, memory, harness, astrbot, mcp_gateway (all `mode: mock`).  
Direct mock: `http://localhost:8082/health` (harness), `:8083` (astrbot), `:3003` (nango), `:8081` (memory). OpenAPI: `http://localhost:8000/docs`.

**Done when:** Compose file lists all sidecars; health test is green; nginx placeholders gone for those services.

---

### T2 — Adapter interfaces + offline mock mode (P0)  ✅ done

**Day:** 1–2  
**Goal:** Stable facades Dev1 can call. Mock mode works with no API keys.

**Implement (interfaces only, behavior mocked):**

```text
AgentService.run(...)
MessagingService.connect/list/...
AuthConnector.authorize/callback/refresh
MCPService.list_catalog/register/list_tools/invoke
MemoryService.store/search/recall/update/delete
LLMService.chat/stream
ContextBuilder.build(...)
```

**Verify:** unit tests that mocks return contract-shaped JSON (no live network).  
**Demo:** OpenAPI shows the methods; a short `docs/` note or `/docs` screenshot of agent/memory/messaging/integrations paths.  
**Verified (2026-08-18):** `pytest` 19 passed. No `app.adapters` imports in `app/api/`.  
Open: http://localhost:8000/docs — `GET /messaging/platforms`, `POST /messaging/{platform}/connect`, `POST /memories`.  
**Done when:** routers still thin; no Nango/AstrBot/Harness imports in `app/api/`.

---

### T3 — LLMService ping (P1)  ✅ done

**Day:** 2  
**Goal:** DeepSeek via `LLMService`. If `DEEPSEEK_API_KEY` missing, mock chat still returns a canned reply.

**Verify:** `GET /api/v1/health/llm` or `python scripts/ping_llm.py` (from `backend/`).  
**Demo:** “LLM mock: ok” or a 1-line live ping (redact key).  
**Verified (2026-08-18):** `pytest` 22 passed. Router calls `LLMService.ping()` only.  
Demo: http://localhost:8000/api/v1/health/llm — `mode` is `mock` without a key, `live` when `DEEPSEEK_API_KEY` is in `backend/.env`.  
**Done when:** Harness/AstrBot can share this config via env; routers do not call DeepSeek.

---

### T4 — MemoryService + TencentDB adapter (P1)  ✅ done

**Day:** 2  
**Goal:** `store` / `recall` (and search) behind `MemoryService`. Live TencentDB if reachable; otherwise in-process mock. Postgres `memories` UI mapping stays Dev1; we may persist run-facing memory records only if schema exists — **do not invent Goal tables**.

**Verify:** pytest roundtrip store → recall.  
**Demo:** curl store a fact, curl recall it.  
**Verified (2026-08-18):** `pytest` 24 passed. `python scripts/smoke_memory.py` → `MEMORY mock: ok`. Report: [report/T4.md](report/T4.md).  
**Done when:** Use-memory drawer path has a working API even in mock mode.

---

### T5 — AuthConnector + Nango connect URL (P0 for Import)  ✅ done

**Day:** 2  
**Goal:** `AuthConnector.authorize(...)` returns a connect URL (Nango or nango-mock). No tokens in the response body beyond a reference id.

**Verify:** test `start_oauth` returns `authorizationUrl` + `state`.  
**Demo:** POST connect → open the mock URL in a browser (consent page or “connected” HTML).  
**Done when:** Dev1 can wire `POST /integrations/{key}/connect` to this interface without SDK code.

---

### T6 — MCP registry + gateway invoke stub (P1)

**Day:** 3  
**Goal:** Register tools from one mock connection. `MCPGateway.invoke(tool, args)` routes, injects credentials internally, writes `mcp_audit_events` **if Dev1 tables exist** — otherwise audit to a local list/file and document the gap.

**Verify:** connect mock → registry row; invoke stub returns JSON; secrets never appear in invoke result.  
**Demo:** `list_tools` + one `invoke` in `/docs` or curl.  
**Done when:** `AgentService` can list allowed tools without seeing tokens.

---

### T7 — ContextBuilder + AgentService → Harness (P0 for AI demo)

**Day:** 3  
**Goal:** `POST /agents/runs` builds context (goal id + memory + allowed MCP tools) and runs via DeepSeek Harness. If Harness is blocked, `FallbackLoopAdapter` behind the **same** `AgentService` interface.

**Verify:** integration test: memory + run persists (`agent_runs` if model exists, else service-level record).  
**Demo:** run response with session/events; show it in `/docs`.  
**Done when:** no second agent loop in AstrBot; routers do not import Harness.

---

### T8 — AstrBot one-platform connect (P1)

**Day:** 4  
**Goal:** `GET /messaging/platforms` + `POST /messaging/{platform}/connect` for one platform (Telegram or Discord). Dev/mock OK if tokens missing. Register as MCP/source. High-impact tools require a confirmation flag.

**Verify:** connect mock → messaging source/MCP row.  
**Demo:** platforms JSON + “Telegram connected (mock)” card payload.  
**Done when:** AstrBot is messaging only; no Goals/Use loop inside it.

---

### T9 — Scale proof + vertical-slice smoke (P2)

**Day:** 4–5  
**Goal:** `scripts/bulk_register_mcp.py` loads N MCP definitions from JSON. `scripts/smoke_vertical_slice.py` covers: catalog connect (mock) + memory + Harness run. Document 3-step add-connector in `docs/mcp-catalog.md`.

**Verify:** both scripts exit 0 in mock mode.  
**Demo:** script output log for the daily freeze; “added N connectors without new routers”.  
**Done when:** Day-5 DoD items that Dev2 owns are green.

---

## Daily submit template

Copy this into the team update:

```text
Date:
Task completed: T#
What shipped:
How we verified (command + result):
Visible demo (URL / JSON / screenshot):
Blocked by (Dev1 / sidecar / keys):
Next task: T#
```

---

## Day mapping (Dev2 only)

| Day | Tasks | Visible result |
|-----|--------|----------------|
| 1 | T1, start T2 | Sidecar health JSON |
| 2 | T2 finish, T3, T4, T5 | LLM ping + memory roundtrip + connect URL |
| 3 | T6, T7 | Tool invoke stub + Harness (or fallback) run |
| 4 | T8, start T9 | AstrBot platform connect + bulk register |
| 5 | T9 finish | Green `smoke_vertical_slice.py` |

---

## Merge / schemas

- Morning rebase onto latest `main` (or agreed integration branch). No force-push to `main`.
- `backend/app/schemas/` has a **day-owner**. Do not edit Goal/catalog schemas unless coordinated that morning.
- Conventional commits: `feat(harness)`, `feat(astrbot)`, `feat(nango)`, `feat(mcp)`, `feat(memory)`, `feat(llm)`.
