# API contracts

Base URL: `/api/v1`  
Auth: `Authorization: Bearer <token>`  
Development accepts unauthenticated requests and treats them as the local admin (`dev-user`).

JSON uses **camelCase** aliases to match the frontend.

Errors:

```json
{ "error": { "code": "not_found", "message": "Goal not found", "details": {} } }
```

## Health

`GET /health`

```json
{ "status": "ok", "service": "Weeple AI OS API", "version": "0.1.0", "environment": "development" }
```

## Auth

`POST /auth/token` `{ "username", "password" }` → `{ "access_token", "token_type": "bearer" }`

`GET /auth/me` → `{ "id", "username", "display_name" }`

Default local admin: `admin` / `weeple` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).

`GET /health/sidecars` — pings Harness, AstrBot, Nango, and Memory through `SidecarHealthService`. Routers do not call sidecar URLs.

```json
{
  "status": "ok",
  "sidecars": [
    { "name": "harness", "mode": "mock", "status": "ok", "url": "http://localhost:8082", "detail": null }
  ]
}
```

`GET /health/llm` — DeepSeek ping through `LLMService` (never returns the API key).

```json
{ "status": "ok", "mode": "mock", "model": "deepseek-chat", "preview": "[mock] received: Reply with the single word pong." }
```

`mode` is `live` when `DEEPSEEK_API_KEY` is set in `backend/.env`.

## Goals

`GET /goals` → `{ "goals": Goal[], "total": number }`

`POST /goals` → create

`GET /goals/{goalId}` → `Goal`

`PATCH /goals/{goalId}` → partial update (`progress`, `status`, `monitoringPaused`, `subgoals`)

`DELETE /goals/{goalId}` → 204

### Goal shape (matches `goalProfiles[]` in app-runtime)

| Field | Type |
|-------|------|
| id | string |
| title | string |
| short | string |
| status | string |
| progress | number |
| scheduleOffset | number |
| scheduledTime | string |
| description | string |
| category | string |
| subgoals | `{ name, done, total, state }[]` |
| taskLabels | string[] |
| observations | optional |
| prediction | optional |
| suggestions | optional |
| monitoringPaused | boolean |

## Tasks

`GET /tasks?goalId=` → `{ "tasks", "total" }`

`PATCH /tasks/{taskId}` → `{ name?, state?, dueAt?, subgoalName? }`

## Sources

`GET /sources?category=all` → `{ sources, total, assetsProcessedToday }`

`PATCH /sources/{id}` — toggle `aiEnabled`, status

`POST /sources/{id}/disconnect` — revoke for real, not a status flip. Blocks AI
use locally (`aiEnabled=false`, `statusType=revoked`), sets the connection to
`revoked`, then calls `AuthConnector.revoke` and `MCPService.unregister`. Those
two run independently, so a provider outage still drops the tool registry entry.
A failure is reported in `connection.errorMessage` rather than swallowed.

`POST /sources/{id}/reconnect` — body `{ redirectUri? }`, returns a `Source` plus
`{ authorizationUrl?, state?, reauthorizationRequired }`. Behaviour depends on
what is actually recoverable:

| Connection state | Behaviour |
| --- | --- |
| Revoked, `authType` `nango`/`astrbot` | Restarts the connect flow and returns `authorizationUrl`; the source stays blocked until the callback lands |
| Live | Calls `AuthConnector.refresh`; on failure the connection goes to `error` and the source to `attention` |
| No connection (local bridge, folder) | Straight re-enable, no authorization round trip |

Revoking a third-party grant destroys the upstream token, so it cannot be
restored by writing `connected` back into the column — the client must follow
`authorizationUrl`. Re-authorization creates a new connection row and leaves the
revoked one as history.

## Integrations

`GET /integrations/catalog?q=&category=` → `{ items, total }`

Catalog item: `{ id, name, category, method, description, scopes, authType, nangoProviderKey, logoUrl }`

Live Nango: `authorizationUrl` is the Connect UI (`http://localhost:3009/?session_token=…`). No OAuth tokens in the body.

`authType`: `nango` | `astrbot` | `mcp_url` | `api_key`

Categories match Import filters: `device`, `files`, `productivity`, `health`, `identity`, `communication`

`POST /integrations/connect` `{ integrationId, redirectUri? }` → `{ authorizationUrl, state }`

`POST /integrations/{key}/connect` — same, key in the path

`GET /integrations/callback?code=&state=` — OAuth callback; persists connection + source; redirects to the frontend when `redirectUri` is an http(s) URL

## Overview

`GET /overview` → `{ clusters, calendarTasks, activity }`

Clusters are live counts from goals and sources. Activity is backed by `activity_events`.

## Agents / memories / messaging

`POST /agents/runs` — start mission (`AgentService.run` → DeepSeek Harness; FallbackLoopAdapter if blocked)
`GET /agents/runs/{runId}` — status + session events
`GET /memories/proposals`  
`POST /memories` `{ title, content, source? }`  
`GET /memories?q=` — search  
`GET /memories/{id}` — recall  
`PATCH /memories/{id}`  
`DELETE /memories/{id}`  
`GET /messaging/platforms` — AstrBot IM platforms (`role: messaging`)  
`POST /messaging/{platform}/connect` — `{ platform, status, credentialRef, card, sourceId, mcpServerId }` (no tokens)  
`GET /messaging/sources` — messaging sources registered from connect  
`POST /messaging/messages`

Dev2 mock facades (no live keys): `AuthConnector.authorize/callback/refresh`, `MCPService.list_catalog/register/list_tools/invoke`, `LLMService.chat/stream`, `ContextBuilder.build`, `KnowledgeService.search` (stub).

Pydantic source of truth: `backend/app/schemas/`.

## Dev2 service contracts (implement behind adapters)

```text
AgentService.run(...)                         # → DeepSeek Harness
MessagingService.connect/list/...             # → AstrBot
AuthConnector.authorize/callback/refresh      # → Nango
MCPService.list_catalog/register/list_tools/invoke
MemoryService.store/search/recall/update/delete
LLMService.chat/stream
KnowledgeService.search                       # stub
ContextBuilder.build(...)
```

Additional HTTP (Dev2):

- `GET /health/sidecars` — **T1 done**
- `GET /messaging/platforms`, `POST /messaging/{platform}/connect` — **T2 done** (mock)
- Memories CRUD `POST/GET/DELETE /memories` — **T2 done** (mock)
- MCP registry `POST /mcp/register`, `GET /mcp/servers`, `GET /mcp/servers/{id}/tools`, `POST /mcp/invoke`, `GET /mcp/audit` — **T6**
- Agent allowed tools `GET /agents/tools` — **T6** (names only, no tokens)

Errors: `{ "error": { "code", "message", "details" } }`. Never return OAuth tokens to the frontend; store credential references only.
