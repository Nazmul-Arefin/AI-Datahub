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

`POST /sources/{id}/disconnect` | `/reconnect` — revoke or restore a connection (calls AuthConnector/MCPService interfaces)

## Integrations

`GET /integrations/catalog?q=&category=` → `{ items, total }`

Catalog item: `{ id, name, category, method, description, scopes, authType, nangoProviderKey, logoUrl }`

`authType`: `nango` | `astrbot` | `mcp_url` | `api_key`

Categories match Import filters: `device`, `files`, `productivity`, `health`, `identity`, `communication`

`POST /integrations/connect` `{ integrationId, redirectUri? }` → `{ authorizationUrl, state }`

`POST /integrations/{key}/connect` — same, key in the path

`GET /integrations/callback?code=&state=` — OAuth callback; persists connection + source; redirects to the frontend when `redirectUri` is an http(s) URL

## Overview

`GET /overview` → `{ clusters, calendarTasks, activity }`

Clusters are live counts from goals and sources. Activity is backed by `activity_events`.

## Agents / memories / messaging

`POST /agents/runs` — start mission (Dev2)  
`GET /agents/runs/{runId}` — status  
`GET /memories/proposals`  
`POST /messaging/messages`

Pydantic source of truth: `backend/app/schemas/`.
