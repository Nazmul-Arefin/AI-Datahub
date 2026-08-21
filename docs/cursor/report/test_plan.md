# Manual test plan — merged frontend + backend

**Who:** you (follow in order; tick the scorecard at the end)  
**What this proves:** the GitHub `main` merge (Dev1 product pages + Dev2 sidecars) works on this laptop  
**When to use:** after `git pull origin main` and with Compose + UI running  
**Do not paste secrets** (DeepSeek key, Telegram token, JWTs) into this file or into chat.

---

## How to read each task

Every task has four parts:


| Field               | Meaning                                                         |
| ------------------- | --------------------------------------------------------------- |
| **Your task**       | Exactly what to click or run                                    |
| **Expected result** | What “good” looks like                                          |
| **Conclusion**      | What you can claim if it matches — or what it means if it fails |
| **Parts tested**    | Frontend surface + backend route/sidecar                        |


**Verdicts you will write in the scorecard**

- **Pass** — matches expected. Live API (or live sidecar) is in play.
- **UI-only** — screen works, but the data is still the **in-memory mock** (API never called, or call failed and UI fell back).
- **Fail** — broken, blank, 500, CORS error, or sidecar down.
- **Skip** — you did not run it (note why).

**How to tell live API vs mock fallback**

1. Open DevTools → **Network**. Filter `8000`.
2. Reload the page. You should see `goals`, `overview`, `sources`, or `integrations/catalog` as **200**.
3. If those requests are **missing**, **(failed)**, or **CORS error**, the UI may still look fine because repositories return `null` and `app-runtime.js` keeps local mock data. Console will often show `[goalsRepository] API unavailable, using mocks` (or sources/overview).
4. That is **not** a full pass. Mark **UI-only** or **Fail**.

---



## 0. Start the stack (do this first)✅

**Your task**

From the repo root (`AI-Datahub/`):

```powershell
git status
git pull origin main

docker compose --env-file backend/.env --profile owned-memory up -d
npx --yes serve frontend -l 3000
```

Open:

- UI: [http://localhost:3000/#/overview](http://localhost:3000/#/overview)  
- API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
- Health: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

Confirm `frontend/index.html` contains:

`window.__WEEple_API__ = 'http://127.0.0.1:8000/api/v1'`

**Expected result**

- `git status` is on `main`, in sync with `origin/main`.
- Health JSON: `"status": "ok"`.
- UI shell loads (top bar, four nav items: Overview, Goals, Import Data, Use Data). Do **not** open `file://` or the repo-root folder listing.

**Conclusion**

- **Pass:** you are testing the merged tree with API + static UI.  
- **Fail:** pull/compose/serve never started — stop here; later page tests are meaningless.

**Parts tested**

- Frontend: `npx serve`, hash router, `index.html` API base.  
- Backend: FastAPI process, Compose `api` service, CORS for `localhost:3000`.

---



## 1. Sidecar board (backend health)✅

**Your task**

Browser or PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health/sidecars
```

Also open: Nango [http://localhost:3003](http://localhost:3003) · AstrBot [http://localhost:6185](http://localhost:6185) · Memory Hub [http://localhost:8125](http://localhost:8125) · Harness [http://localhost:3080/health](http://localhost:3080/health) · MCP [http://localhost:8080/health](http://localhost:8080/health)

**Expected result**

Overall `"status": "ok"`. Each of `nango`, `memory`, `harness`, `astrbot`, `mcp_gateway` is `"ok"` and `"mode": "live"`.

**Conclusion**

- **Pass:** Dev2 sidecars are reachable from FastAPI. Product pages can call adapters.  
- **Fail / degraded:** UI can still show goals from Postgres, but Connect / agent run / live memory / Telegram will fail. Fix Compose before Import/Use live tests.

**Parts tested**

- Frontend: none (this is infra).  
- Backend: `GET /api/v1/health/sidecars`, `SidecarHealthService`, all five sidecars.

---



## 2. LLM ping (DeepSeek)✅

**Your task**

Open [http://127.0.0.1:8000/api/v1/health/llm](http://127.0.0.1:8000/api/v1/health/llm)

**Expected result**

`"status": "ok"`, `"mode": "live"`, `"model": "deepseek-v4-pro"` (or the model in `.env`). No API key in the JSON.

**Conclusion**

- **Pass:** Harness and any LLM-backed run can reach DeepSeek.  
- **mode mock:** `.env` / container missing `DEEPSEEK_API_KEY`, or API not recreated after you set it. Agent runs will be canned, not real.

**Parts tested**

- Frontend: none.  
- Backend: `LLMService`, DeepSeek adapter, `DEEPSEEK_API_KEY`.

---



## 3. Auth (admin)✅

**Your task**

In `/docs`, `POST /api/v1/auth/token` with:

```json
{ "username": "admin", "password": "weeple" }
```

Then `GET /api/v1/auth/me` (optional: paste the token as Bearer).

In development, pages work **without** a token (`APP_ENV=development`). This task still proves login exists.

**Expected result**

Token 200 with `access_token`. `/me` returns the admin profile. Wrong password → 401.

**Conclusion**

- **Pass:** Dev1 auth + Postgres user seed.  
- **Fail:** DB not seeded, `USE_DATABASE` not true in the **container**, or password mismatch.

**Parts tested**

- Frontend: not wired to a login screen yet (`__WEEple_TOKEN__` is optional).  
- Backend: `POST /auth/token`, `GET /auth/me`, `auth_service`, Postgres `users`.

---



## 4. Overview page✅

**Your task**

1. Open [http://localhost:3000/#/overview](http://localhost:3000/#/overview)
2. Confirm the 3D topology (goals / data / memory clusters) draws.
3. Click a cluster or activity item if present.
4. Network: `GET http://127.0.0.1:8000/api/v1/overview` → 200.

**Expected result**

Page is not a blank outlet. Topology legend visible. Overview JSON has `clusters`, `calendarTasks`, `activity`. CORS header allows `http://localhost:3000`.

**Conclusion**

- **Pass + Network 200:** Overview is **Postgres/API**, not only the old mock SPA.  
- **Pretty UI but no** `/overview` **request:** **UI-only** — frontend mock. Check API URL and CORS.  
- **Fail:** canvas missing, JS error in Console.

**Parts tested**

- Frontend: Overview route, `overview/view.html`, topology canvas, `overviewRepository.js`.  
- Backend: `GET /overview`, `overview_service`, activity/goals seed.

---



## 5. Goals page — list✅

**Your task**

Open [http://localhost:3000/#/goals](http://localhost:3000/#/goals)  

Network: `GET /api/v1/goals` → 200, `goals` array length ≥ 1 (merged seed is typically **5**).

**Expected result**

Goal cards/list match API titles (not a totally empty state). Switching goals updates the main panel.

**Conclusion**

- **Pass:** Dev1 goals CRUD read path + frontend `goalsRepository`.  
- **UI-only:** list looks like the old hardcoded demo and Network has no `/goals`.  
- **Fail:** 500, empty with error toast, layout broken.

**Parts tested**

- Frontend: Goals route, goal switcher, `loadGoalsFromApi`.  
- Backend: `GET /goals`, `goal_service`, Postgres `goals`.

---



## 6. Goals page — create / edit / delete

**Your task**

1. Create a goal from the UI (new-goal sheet if the button exists).
2. Confirm Network `POST /api/v1/goals` → **201**.
3. Reload `#/goals` — the new goal is still there (proves Postgres, not only RAM).
4. Edit a field if the UI allows — `PATCH /goals/{id}` → 200.
5. Delete if the UI allows — `DELETE` → 200; reload gone.
  If there is no delete control, run delete from `/docs` on the id you created, then reload the UI.

**Expected result**

Create survives refresh. PATCH/DELETE reflected after reload.

**Conclusion**

- **Pass:** Goals are real app state (Dev1 DB).  
- **Create works until refresh:** frontend-only draft (`createGoalOnApi` failed or returned null).  
- **Fail:** 422/500 on POST (schema mismatch after merge).

**Parts tested**

- Frontend: create/edit/delete controls, `createGoalOnApi` / `updateGoalOnApi` / `deleteGoalOnApi`.  
- Backend: `POST/PATCH/DELETE /goals`.

---



## 7. Import Data — connected sources

**Your task**

Open [http://localhost:3000/#/import-data](http://localhost:3000/#/import-data)  

Network: `GET /api/v1/sources` → 200 (merged seed is typically **12** sources).

Click a source card / inspector. Try **Disconnect** if shown.

**Expected result**

Gallery populated from API. Disconnect → `POST /sources/{id}/disconnect` → 200 and status changes. Reconnect if the button exists.

**Conclusion**

- **Pass:** Import list is Dev1 `source_service` + Postgres.  
- **UI-only:** gallery still shows demo tiles with no `/sources` call.  
- **Fail:** empty gallery + 500.

**Parts tested**

- Frontend: Import Data gallery, inspector, `sourcesRepository.js`.  
- Backend: `GET /sources`, `POST .../disconnect` (and reconnect if used).

---



## 8. Import Data — catalog search + Connect wizard

**Your task**

1. Open the connect wizard (`#/import-data?wizard=1` or the Connect control).
2. Network: `GET /api/v1/integrations/catalog` → 200 (typically **14** items).
3. Search or pick a style (OAuth / Telegram-like messaging).
4. Continue until Connect. Network: `POST /api/v1/integrations/connect` with `integrationId`.
5. For **github** (or any Nango-backed id): `authorizationUrl` should start with `http://localhost:3009` and include `session_token`. Open that URL — Nango Connect UI, not a Docker hostname `http://nango:3003`.
6. For a messaging tile, you may get an AstrBot/Telegram card instead of Nango.

**Expected result**

Catalog from API, not only six hardcoded wizard tiles. Connect JSON has `authorizationUrl` + `state` and **no** OAuth access token.

**Conclusion**

- **Pass (Nango URL on :3009):** T5 live Connect + Dev1 `integrations` router + `AuthConnector`.  
- **URL is** `http://nango:3003/oauth/connect/...`**:** mock fallback — `NANGO_SECRET_KEY` missing in the API container; recreate API after bootstrap.  
- **Wizard still hardcoded only:** catalog fetch failed; mark UI-only.  
- **Fail:** 500/CORS on catalog or connect.

**Parts tested**

- Frontend: wizard, catalog list, `startConnectOnApi`.  
- Backend: `GET /integrations/catalog`, `POST /integrations/connect`, Nango sidecar `:3003/:3009`.

---



## 9. Telegram / AstrBot (messaging)

**Your task**

UI may not have a dedicated “Telegram” page. Use `/docs` or PowerShell:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/v1/messaging/telegram/connect
```

Optional send (only if you already chatted with the bot; use your real chat id):

`POST /api/v1/messaging/messages` with `{ "content": "test from laptop", "threadId": "<chat id>" }`

Open [http://localhost:6185](http://localhost:6185) — AstrBot still logged in.

**Expected result**

Connect 200, `mode: live`, card like **Telegram connected (live)**. Send 200 with a Telegram `message.id` if you send. Bot appears in Telegram.

**Conclusion**

- **Pass:** T8 live path (bot token + optional dashboard JWT). Recipients still see a **bot**, not your personal account (platform limit).  
- **mode mock:** token missing in the **container** (recreate API after `.env` change).  
- **401 on AstrBot dashboard APIs only:** JWT expired; Telegram Bot API send can still work.

**Parts tested**

- Frontend: Import wizard messaging tile if you used it; otherwise `/docs` only.  
- Backend: `MessagingService`, `AstrBotClient`, Telegram Bot API, AstrBot `:6185`.

---



## 10. Use Data page — mission UI

**Your task**

Open [http://localhost:3000/#/use-data](http://localhost:3000/#/use-data)  

Open the mission workspace / assistant chrome. Open **Memory** drawer (`#/use-data?memory=1` or the Memory button). Toggle “Available to AI”, Correct, Delete **in the drawer**.

**Expected result**

Use Data layout, agent avatars, memory drawer open/close. Drawer list currently comes from **JavaScript inside** `app-runtime.js`, not `GET /memories`.

**Conclusion**

- **Pass as UI shell:** Use Data **page** works.  
- **Do not** conclude “live Tencent memory” from the drawer alone. That is **UI-only** for memory CRUD until the drawer calls `/memories`.  
- **Fail:** page blank, drawer does not open, Console errors.

**Parts tested**

- Frontend: Use Data route, mission workspace, memory drawer **UI**.  
- Backend: **not** `/memories` on this task (see task 11).

---



## 11. Memory API (backend; not yet the Use Data drawer)

**Your task**

In `/docs`:

1. `POST /api/v1/memories` `{ "title": "test-plan", "content": "manual check" }` → 200, `mode: live`.
2. `GET /api/v1/memories/{id}` → 200 same title.
3. `GET /api/v1/memories/no-such-id` → **404**.
4. `GET /api/v1/memories?q=test-plan` → items (may be delayed while Core indexes).

Reload Use Data — the new memory **will not** appear in the drawer today. That is expected.

**Expected result**

Store/recall against Memory Core (`:8420`). Missing id is 404, not 500.

**Conclusion**

- **Pass:** T4 live adapter. Gap: **frontend memory drawer not wired**.  
- **Fail:** 500 on store (Core down or `MEMORY_MODE` not live in container).

**Parts tested**

- Frontend: none (known gap).  
- Backend: `POST/GET /memories`, `MemoryService`, Tencent Memory Core.

---



## 12. Agent run (Harness) vs Use Data agents

**Your task**

The four agent avatars on Use Data are **display chrome**, not Harness sessions.

In `/docs`: `POST /api/v1/agents/runs`

```json
{ "mission": "Say ping in one word", "goalId": "<a real goal id from GET /goals>" }
```

Then `GET /api/v1/agents/runs/{runId}` until `completed` (wait a few seconds). `GET .../missing-run` → 404.

**Expected result**

200, `mode: live`, `sessionId` set. GET later `completed`. Overview activity **may** show the run if Dev1 wired activity on runs.

**Conclusion**

- **Pass:** T7 `AgentService` → DeepSeek Harness.  
- **Use Data still “Working/Waiting”:** that is **UI-only**; it does not prove Harness.  
- **Fail:** 422 (wrong body), 500, or forever `running` with Harness down.

**Parts tested**

- Frontend: not connected to `/agents/runs` yet.  
- Backend: `POST/GET /agents/runs`, ContextBuilder, Harness `:3080`.

---



## 13. MCP tools (backend)

**Your task**

`/docs`:

- `GET /api/v1/mcp/servers`  
- `POST /api/v1/mcp/register` `{ "connectionId": "conn-test", "name": "github" }`  
- `POST /api/v1/mcp/invoke` `{ "tool": "list_repos", "args": {} }` → `ok: true`  
- `POST /api/v1/mcp/invoke` `{ "tool": "send_message", "args": { "text": "hi" } }` → `ok: false`, `confirmation_required`  
- Same with `"confirm": true` in args → `ok: true`  
- `GET /api/v1/mcp/audit` → `sink: sidecar` when gateway is live

JSON must not contain bot tokens or Nango secrets.

**Expected result**

Stub invoke works; high-impact tool gated. This is **not** live GitHub API.

**Conclusion**

- **Pass:** T6 registry + gateway.  
- **Fail:** 500, tokens leaked, confirm bypassed.

**Parts tested**

- Frontend: none (no MCP screen).  
- Backend: `mcp` router, registry, `mcp-gateway` `:8080`.

---



## 14. Navigation, shell, and fallback routes

**Your task**

Click all four nav items. Try hashes: `#/`, `#/data`, `#/memory`, `#/calendar`. Resize the window. Open a second page, then Overview again — topology should recover.

**Expected result**

Router maps legacy hashes (`data` → Import, `memory` → Use). Shell (topbar, toast) stays. No full white screen.

**Conclusion**

- **Pass:** frontend router (`routes.js`, `LEGACY_HASH_MAP`).  
- **Fail:** broken outlet, CSS missing (`page.css` 404).

**Parts tested**

- Frontend: router, shell, page CSS/JS mount.  
- Backend: none.

---



## 15. Cross-page consistency (Day-5 slice)

**Your task**

1. Note a goal title on Goals.
2. Overview clusters / activity should mention related goals or sources (same API seed).
3. Import sources count should match `GET /sources`.
4. Optional: create a goal, confirm it appears after reload on both Goals and (if wired) Overview.

**Expected result**

Same ids/titles from Postgres on Goals + Overview. Not two different mock datasets.

**Conclusion**

- **Pass:** one backend of record.  
- **Mismatch after reload:** one page still on mocks.

**Parts tested**

- Frontend: Goals + Overview + Import hydration.  
- Backend: shared seed / Postgres.

---



## 16. Negative checks (bugs we already fixed)

**Your task**


| Call                                                                             | Expect                                                           |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `GET /api/v1/memories/no-such-id`                                                | 404                                                              |
| `GET /api/v1/agents/runs/missing-run`                                            | 404                                                              |
| `GET /api/v1/goals/no-such-id`                                                   | 404                                                              |
| Health with sidecars down (optional: stop one container, hit `/health/sidecars`) | that sidecar `down`, not a fake 200 from counting HTTP 404 as up |


**Conclusion**

- **Pass:** B3/B5/B8-style behavior still holds after the merge.  
- **Fail:** 500 instead of 404 — merge regression.

**Parts tested**

- Frontend: none.  
- Backend: error mapping, sidecar ping.

---



## Honest gaps (do not mark as product-complete)

These can **look** finished in the UI but are not end-to-end:


| Surface                   | Reality                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| Use Data memory drawer    | Local JS list; does not call `/memories`                              |
| Use Data agent avatars    | Decorative; does not call `/agents/runs`                              |
| Telegram “as me”          | Impossible via Bot API; bot identity only                             |
| MCP `list_repos`          | Stub, not GitHub                                                      |
| Nango GitHub OAuth finish | Needs a GitHub app in Nango Integrations                              |
| Login screen              | No frontend login; API allows unauthenticated access in `development` |


---



## Scorecard (fill this in)

Copy the table into notes or tick here.


| #   | Task                       | Verdict (Pass / UI-only / Fail / Skip) | Notes |
| --- | -------------------------- | -------------------------------------- | ----- |
| 0   | Stack + UI serve           |                                        |       |
| 1   | Sidecar board              |                                        |       |
| 2   | LLM ping                   |                                        |       |
| 3   | Auth token / me            |                                        |       |
| 4   | Overview + `/overview`     |                                        |       |
| 5   | Goals list + `/goals`      |                                        |       |
| 6   | Goals create/edit/delete   |                                        |       |
| 7   | Import sources             |                                        |       |
| 8   | Catalog + Connect          |                                        |       |
| 9   | Telegram / AstrBot         |                                        |       |
| 10  | Use Data shell / drawer UI |                                        |       |
| 11  | Memory API                 |                                        |       |
| 12  | Agent Harness run          |                                        |       |
| 13  | MCP register/invoke        |                                        |       |
| 14  | Nav / legacy hashes        |                                        |       |
| 15  | Cross-page data            |                                        |       |
| 16  | 404 / health negatives     |                                        |       |


**Overall**

- **Demo-ready (merged slice):** 0–8 Pass, 10 Pass as UI shell, 11–13 Pass on `/docs`.  
- **Not demo-ready:** any of 0, 4, 5, 7 Fail; or 4–8 are UI-only.

---



## If something fails — first fixes


| Symptom                  | Likely cause                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| UI works, Network empty  | Wrong `__WEEple_API__`, or opened `file://`                                                        |
| CORS error               | UI not on localhost/127.0.0.1; restart API                                                         |
| Goals vanish on refresh  | `USE_DATABASE` false in **container**; recreate `api`                                              |
| Connect URL `nango:3003` | Missing `NANGO_SECRET_KEY`; `python backend/scripts/bootstrap_nango_secret.py` then recreate `api` |
| Sidecar down             | `docker compose --env-file backend/.env --profile owned-memory up -d`                              |
| LLM mock                 | Recreate API after setting `DEEPSEEK_API_KEY`                                                      |
| Telegram mock            | Recreate API after setting `TELEGRAM_BOT_TOKEN`                                                    |
| `.env` change ignored    | Compose only reads env at **container create** — `--force-recreate api`                            |


---



## Optional: keep this file’s checklist in git

After you finish, you can paste the filled scorecard into a short note for Dev1 (no secrets). You do not need to commit the filled results.