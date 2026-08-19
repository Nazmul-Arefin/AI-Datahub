# Bugs and errors — retest (2026-08-19)

**Owner:** Developer 2  
**Scope:** T0–T9 code + live Compose stack  
**This file records reproduced bugs/errors.** It is not a task report.

## Fix pass — B1–B4 (2026-08-19)

| Bug | Status | Live retest |
|-----|--------|-------------|
| B1 store 500 | **Fixed** | `POST /api/v1/memories` → **200** `{id, title, content, mode: live}` |
| B2 search 500 | **Fixed** | `GET /api/v1/memories?q=focus` → **200** `{items: [...], total: 1}` |
| B3 missing id 500 | **Fixed** | `GET /api/v1/memories/no-such-id` → **404** `Memory not found` |
| B4 hybrid recall | **Fixed** | Core `POST /recall` → `code: 0`, `message: ok` (strategy `keyword`; no 10001) |
| pytest | **40 passed** | Adapter tests cover `/capture` shape + string `results` dropped |

What changed:

- `TencentMemoryClient` posts Core `/capture` with `user_content`, `assistant_content`, `session_key`. It no longer calls missing `/memories` CRUD.
- Search never wraps a string `results` envelope as a `MemoryRecord`.
- Unknown ids return `None` → API 404. Sidecar HTTP errors map to **502**, not a raw 500 traceback.
- `tdai-gateway.yaml` `recall.strategy` is `keyword` (official enum is `keyword | embedding | hybrid`; `"fts"` was ignored and Core stayed on hybrid).
- Recalled rows are also kept in a process-local index because capture is L0 and L1 extraction is async.

## Fix pass — B5–B9 (2026-08-19)

| Bug | Status | Retest |
|-----|--------|--------|
| B5 unknown run 200 | **Fixed** | `GET /api/v1/agents/runs/missing-run` → **404** `Agent run not found`; real run still **200** |
| B6 audit sink | **Fixed** | Live `GET /api/v1/mcp/audit` → `"sink": "sidecar"`; mock tests still `"local_file"` |
| B7 duplicate fixture | **Fixed** | Single `client` fixture in `tests/conftest.py` (removed in the B1–B4 pass) |
| B8 404 counted as healthy | **Fixed** | Ping no longer stops on 404; AstrBot now `"detail": "http 200"` (root), not `http 404` |
| B9 unclosed socket | **Fixed** | Health tests call `shutdown()` + `server_close()` + `join()`; pytest **44 passed**, no `ResourceWarning` |
| pytest | **44 passed** | |

What changed:

- `AgentService.get_run` returns `None` when the run is not in the store, Harness, or fallback. The router maps that to **404**. Mock/fallback adapters no longer invent `running` / `unknown` records.
- `McpService.list_audit` sets `sink` to `sidecar` when the gateway mode is live, otherwise `local_file`.
- `SidecarHealthClient.ping` treats 2xx/3xx and 401/403 as up; **404 tries the next path** (`/health` then `/`). All-404 is `down`.
- Sidecar health tests close the local HTTP server socket.

---

---

## How we retested

| Check | Result |
|-------|--------|
| `pytest -q` (forced mock via `tests/conftest.py`) | **44 passed** after B5–B9 |
| `python scripts/bulk_register_mcp.py` | **added 12 connectors**, catalogSize 13 |
| `python scripts/smoke_vertical_slice.py` | **VERTICAL SLICE ok** (mock) |
| Live API `:8000` + sidecars | Health, Nango, MCP, Harness, LLM **ok**; **memory live path ok after B1–B4** |

Mock tests never call live Memory Core. After the B1–B4 fix, Compose `MEMORY_MODE=live` no longer 500s on store/search/recall.

---

## What is working (live)

| Surface | Result |
|---------|--------|
| `GET /api/v1/health` | 200 |
| `GET /api/v1/health/sidecars` | 200, overall `ok` (all five named sidecars reachable) |
| `GET /api/v1/health/llm` | 200, `mode: live`, `model: deepseek-v4-pro`, preview `pong` |
| `POST /api/v1/integrations/connect` `{integrationId: github}` | 200, Nango Connect UI URL (`localhost:3009` + session token) |
| `POST /api/v1/mcp/register` + `POST /mcp/invoke` `list_repos` | 200, stub result, no tokens in JSON |
| `send_message` without `confirm` | 200, `ok: false`, `confirmation_required` |
| `send_message` with `confirm: true` | 200, `ok: true`, `{delivered: true}` |
| `POST /api/v1/agents/runs` | 200, `mode: live`, Harness `sessionId` |
| `GET /api/v1/agents/runs/{runId}` | 200, status moved to `completed` |
| `POST /api/v1/messaging/telegram/connect` | 200 card + MCP/source row (**mock** — no bot token) |
| Goals / tasks / sources / overview / auth `/me` | 200 (Dev1 mock data) |
| Sidecars up | API, Nango, Memory Core/Hub, Harness, AstrBot, MCP gateway |

---

## Bugs (reproduced)

### B1 — Live memory store returns HTTP 500 — **fixed**

**Severity:** high  
**Where:** `POST /api/v1/memories` with Compose `MEMORY_MODE=live`  
**Expected:** store the note and return a `MemoryRecord`.  
**Actual:** `500 Internal Server Error`.

API traceback:

```
app/adapters/memory_tencent/client.py store()
httpx.HTTPStatusError: 404 Not Found for url '...:8420/memories'
```

**Root cause:** `TencentMemoryClient.store` posts a `{title, content, source, messages}` body to Memory Core `/capture`. Official Core rejects that shape (`400 Missing required fields: user_content, assistant_content, session_key`). The adapter then falls back to `POST /memories`, which **does not exist** (`404 Not found: POST /memories`). `raise_for_status()` bubbles as an unhandled 500.

Direct Core check (correct payload): `POST /capture` with `user_content`, `assistant_content`, `session_key` returns **200** `{l0_recorded, scheduler_notified}`.

---

### B2 — Live memory search returns HTTP 500 (schema mismatch) — **fixed**

**Severity:** high  
**Where:** `GET /api/v1/memories?q=focus`  
**Expected:** `{items: [], total: 0, mode: live}` when nothing matches.  
**Actual:** `500`. FastAPI log:

```
ValidationError: 3 validation errors for MemorySearchResponse
  items.0.id Field required
  items.0.title Field required
  items.0.content Field required
  input_value={'results': 'No matching memories found.', 'total': 0, 'strategy': 'fts'}
```

**Root cause:** Core `POST /search/memories` returns `{results: "<string>", total: 0, strategy: "fts"}`. The adapter treats any non-list `results` as a **single item** (`return [data] if data else []`). `MemoryRecord` then requires `id` / `title` / `content`.

---

### B3 — Missing memory id returns HTTP 500 instead of 404 — **fixed**

**Severity:** high  
**Where:** `GET /api/v1/memories/{id}` for an unknown id  
**Expected:** `404 Memory not found`.  
**Actual:** `500`.

Log:

```
httpx.HTTPStatusError: 400 Bad Request for url '...:8420/recall'
```

**Root cause:** `GET /memories/{id}` on Core is 404 (that route does not exist). The adapter then `POST /recall` with `{query: memory_id}` and **no `session_key`**. Core answers `400 Missing required fields: query, session_key`. That is not mapped to `None`, so the router never returns 404.

---

### B4 — Memory Core recall is not usable in this Compose profile — **fixed**

**Severity:** medium (blocks live recall even after B1–B3 payload fixes)  
**Where:** Memory Core `POST /recall` with the required fields  
**Actual:** HTTP 200 body:

```
code: 10001
message: Recall strategy "hybrid" requires EmbeddingService but it is not available.
memory_count: 0
```

Health on `:8420` reports `"embeddingService": false`. `tdai-gateway.yaml` sets `memory.embedding.provider: "none"` and recall `strategy: "hybrid"`. Search over FTS can still return a string (B2); hybrid recall cannot return memories.

---

### B5 — Unknown agent run id returns HTTP 200 “unknown” instead of 404 — **fixed**

**Severity:** low  
**Where:** `GET /api/v1/agents/runs/missing-run`  
**Actual:**

```
{"runId":"missing-run","status":"unknown","sessionId":null,"phase":0,"progress":0.0,"events":[],"mode":"fallback"}
```

**Root cause:** `AgentService.get_run` swallows Harness errors, then `FallbackLoopAdapter.get_run` invents an `unknown` record. Clients cannot tell “not found” from “still running”.

---

### B6 — MCP audit `sink` is always `local_file` in live mode — **fixed**

**Severity:** low  
**Where:** `GET /api/v1/mcp/audit` while `MCP_GATEWAY_MODE=live`  
**Actual:** events come from the MCP gateway sidecar, but the API always returns `"sink": "local_file"` (`McpService.list_audit`). Misleading for operators.

---

### B7 — Duplicate `client` fixture in `tests/conftest.py` — **fixed**

**Severity:** low (tests still pass)  
**Where:** `backend/tests/conftest.py` defines `@pytest.fixture async def client` **twice**. Pytest keeps the last one. Harmless today, easy to break later if someone edits only the first copy.

---

### B8 — Sidecar health treats HTTP 404 as healthy — **fixed**

**Severity:** low  
**Where:** `GET /api/v1/health/sidecars`  
**Actual:** AstrBot is `"status": "ok"` with `"detail": "http 404"` (from inside the API container). `SidecarHealthClient.ping` counts any status **&lt; 500** as up. The WebUI from the host is 200; the in-network `/health` path is not.

---

### B9 — Pytest `ResourceWarning`: unclosed socket — **fixed**

**Severity:** low  
**Where:** `tests/test_sidecar_health.py::test_sidecar_health_client_ping_ok`  
**Actual:** `ResourceWarning: unclosed <socket.socket ...>` after the local `ThreadingHTTPServer` shutdown. 37 tests still pass.

---

## Errors that are configuration / product gaps (not crashes)

These did **not** 500, but they are easy to misread as bugs.

| Item | Status |
|------|--------|
| Telegram connect | **Needs your bot token** in `backend/.env` (`TELEGRAM_BOT_TOKEN`). Until then connect stays mock. |
| `POST /api/v1/messaging/messages` | Echo without token. With token + `threadId` = Telegram chat id, sends via Bot API. |
| MCP `invoke` | Stub payloads (`acme/demo`) — T6 by design; live GitHub is out of Dev2 sprint. |
| Goals / tasks / overview / catalog / auth | Mock lists. **Dev1** owns Postgres models. |
| Agent runs / memory index durability | JSONL under `backend/data/` now mounted into the API container. Dev1 tables still not present. |

---

## Adapter vs Memory Core API (cheat sheet)

What Core actually accepted during this retest:

| Call | Result |
|------|--------|
| `GET /health` | 200, `embeddingService: false` |
| `POST /capture` `{title, content, messages}` | **400** missing `user_content`, `assistant_content`, `session_key` |
| `POST /capture` with those three fields | **200** `{l0_recorded, scheduler_notified}` (no memory id) |
| `POST /memories` | **404** route missing |
| `GET /memories/{id}` | **404** route missing |
| `POST /recall` without `session_key` | **400** |
| `POST /recall` with `query` + `session_key` | 200, hybrid recall error (B4) |
| `POST /search/memories` `{query}` | 200 `{results: "<string>", total, strategy: "fts"}` |

`TencentMemoryClient` still speaks a `/memories` CRUD dialect that this image does not implement.

---

## Why pytest did not catch B1–B4

`backend/tests/conftest.py` sets `DEEPSEEK_API_KEY=""`, `MCP_GATEWAY_MODE=mock`, `HARNESS_MODE=mock`, `ASTRBOT_MODE=mock`. It does **not** force `MEMORY_MODE=mock`, but local test Settings default `memory_mode` is already `mock`. Compose overrides that to `live`. No test hits Memory Core HTTP.

---

## Suggested fix order (remaining)

### B10 — Unknown memory id can return HTTP 200 with unrelated Core recall (new) — **fixed**

**Severity:** medium  
**Where:** `GET /api/v1/memories/no-such-id` after B1–B4  
**Expected:** **404** `Memory not found`  
**Actual (before fix):** **200** with Core L3 persona text stuffed into that id.

**Fix:** `TencentMemoryClient.recall` only returns the write-through index (or a Core `GET /memories/{id}` whose JSON `id` matches). It no longer calls `POST /recall` for get-by-id. Agent-run and memory indexes now reload from `backend/data/*.jsonl`; Compose mounts that directory so API recreate keeps them.

---
