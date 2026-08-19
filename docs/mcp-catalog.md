# MCP connector catalog

How to add a new Import Data connector (no new FastAPI router).

## Three steps

1. Add a catalog row in [`backend/app/services/seed_data.py`](../backend/app/services/seed_data.py) (`INTEGRATION_CATALOG`) with:
   - `id` (stable key)
   - `category` matching an Import filter slug
   - `authType`: `nango` | `astrbot` | `mcp_url` | `api_key`
   - `nangoProviderKey` when `authType` is `nango`
2. Map the catalog key to a source card id in `CATALOG_SOURCE_IDS` (optional; defaults to the catalog key).
3. Re-seed: `python backend/scripts/seed_db.py` (Postgres) or restart the API (in-memory).

Dev2 then maps Nango provider / AstrBot platform / raw MCP URL. The connect API already routes by `authType` through `AuthConnector` or `MessagingService`.

## Categories

- `device` — local bridge (phone, laptop, USB)
- `files` — explicit folder selection
- `productivity` — calendar, Notion, GitHub, Linear, Slack, Gmail
- `health` — fitness APIs
- `communication` — chat adapters (WeChat, Telegram, Discord)
- `identity` — public discovery tools

Messaging connectors (`telegram`, `discord`) use `authType: astrbot`. OAuth SaaS connectors use `nango`.

Category slugs are a contract with the Import page filter chips — a row in a
category no chip filters is unreachable in the UI, and `test_catalog_search.py`
fails if the two drift apart.

## What `authType` means for revoke

`authType` also decides what a reconnect can do. `nango` and `astrbot` grants
live at the provider, so revoking destroys them and reconnect must walk the
connect flow again. `api_key` and `mcp_url` connectors have nothing upstream to
rebuild, so reconnect simply re-enables them. See `docs/api-contracts.md`.

Frontend icons live in `frontend/src/shared/js/app-runtime.js` (`sourceAdapterIcon`).
