# API contracts

Base URL: `/api/v1`  
Auth: `Authorization: Bearer <token>` (dev accepts unauthenticated requests)

JSON uses **camelCase** aliases where noted to match the frontend.

## Health

`GET /health`

```json
{ "status": "ok", "service": "Weeple AI OS API", "version": "0.1.0", "environment": "development" }
```

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

`GET /goals/{goalId}` → `Goal`

`PATCH /goals/{goalId}` → partial update (`progress`, `status`, `monitoringPaused`, `subgoals`)

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
| subgoals | `{ name, done, total, state }[]` |
| taskLabels | string[] |
| observations | optional |
| prediction | optional |
| suggestions | optional |
| monitoringPaused | boolean |

## Sources

`GET /sources?category=all` → `{ sources, total, assetsProcessedToday }`

`PATCH /sources/{id}` — toggle `aiEnabled`, status

`POST /sources/{id}/disconnect` | `/reconnect`

## Integrations

`GET /integrations/catalog` — available connectors

`POST /integrations/connect` `{ integrationId, redirectUri? }` → `{ authorizationUrl, state }`  
Live Nango: `authorizationUrl` is the Connect UI (`http://localhost:3009/?session_token=…`). No OAuth tokens in the body.

`GET /integrations/callback?code=&state=` — OAuth callback

## Overview

`GET /overview` → clusters, calendarTasks, activity

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
