# API contracts

Base URL: `/api/v1`  
Auth: `Authorization: Bearer <token>` (dev accepts unauthenticated requests)

JSON uses **camelCase** aliases where noted to match the frontend.

## Health

`GET /health`

```json
{ "status": "ok", "service": "Weeple AI OS API", "version": "0.1.0", "environment": "development" }
```

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

`POST /integrations/connect` — `{ integrationId, redirectUri? }` → `{ authorizationUrl, state }`

`GET /integrations/callback?code=&state=` — OAuth callback

## Overview

`GET /overview` → clusters, calendarTasks, activity

## Agents / memories / messaging

`POST /agents/runs` — start mission  
`GET /agents/runs/{runId}` — status  
`GET /memories/proposals`  
`POST /messaging/messages`

Pydantic source of truth: `backend/app/schemas/`.
