# MCP connector catalog

How to add a new Import Data connector (no new FastAPI router). Day 5 needs this **pipeline**, not 900 live OAuth apps.

Normal Import UX: search catalog → Connect → OAuth/token via Nango or AstrBot → Done. **No raw MCP JSON in the UI path.**

## Three steps (bulk catalog)

1. Add rows to [`backend/app/fixtures/connectors.json`](../backend/app/fixtures/connectors.json) (or regenerate with `python scripts/generate_connectors_fixture.py`).
   - `id`, `name`, `category`, `auth_type`, `availability` (`live` | `api_key` | `mcp_url` | `astrbot` | `coming_soon`)
   - `region`: `cn` (China domestic) or `global`
   - `nango_provider_key` when a future/live Nango OAuth is planned
2. Map known connected source cards in `CATALOG_SOURCE_IDS` when needed (optional).
3. Restart API (seed upserts catalog) or run `python backend/scripts/seed_db.py`.

**Do not** create a new FastAPI router per connector. Enable OAuth later by flipping `availability` to `live` and adding Client ID/Secret in Nango.

China-first: the fixture ships 50+ `region: cn` daily apps (微信 / 钉钉 / 飞书 / 抖音 / 百度网盘 / …) plus global long-tail. Import Data shows catalog cards beside connected sources.

## Legacy three steps (small seed list)

1. Add a catalog row in [`backend/app/services/seed_data.py`](../backend/app/services/seed_data.py) (`INTEGRATION_CATALOG`) with:
   - `id` (stable key)
   - `category` matching an Import filter slug
   - `authType`: `nango` | `astrbot` | `mcp_url` | `api_key`
   - `nangoProviderKey` when `authType` is `nango`
2. Map the catalog key to a source card id in `CATALOG_SOURCE_IDS` (optional; defaults to the catalog key).
3. Re-seed: `python backend/scripts/seed_db.py` (Postgres) or restart the API (in-memory).

Dev2 then maps Nango provider / AstrBot platform / raw MCP URL. The connect API already routes by `authType` through `AuthConnector` or `MessagingService`.

Bulk fixture path (MCP registry proof, not the Import UI): add JSON in `backend/scripts/fixtures/mcp_connectors.json` (`name`, `category`, `auth_type`, plus `nango_provider_key` or `astrbot_platform`, and `mcp_template` / `tools`). `MCPService.register` records the server + discovered tools. Agents call tools only through `MCPService` / `AgentService.list_allowed_tools` (never see secrets). High-impact tools set `confirmationRequired: true`. Invoke writes audit events to `backend/data/mcp_audit.jsonl` until `mcp_audit_events` exists.

## Categories (contract with Import filter chips)

- `device` — local bridge (phone, laptop, USB)
- `files` — explicit folder selection
- `productivity` — calendar, Notion, GitHub, Linear, Slack, Gmail
- `health` — fitness APIs
- `communication` — chat adapters (WeChat, Telegram, Discord)
- `identity` — public discovery tools

Messaging connectors (`telegram`, `discord`, `feishu`, `dingtalk`, `wecom`, `wecom-ai`, `qq`) use `authType: astrbot`. OAuth SaaS connectors use `nango`.

**AstrBot “Add MCP Server” (Extensions → MCP)** is for giving the *bot* extra tools (search, calendars, etc.). It does **not** replace connecting a user’s 飞书/钉钉/企微 account. User app connect still goes through AstrBot **Bots** (platform adapters + QR), then Weeple Import Data → Connect.

China AstrBot setup guide: [`docs/cursor/report/astrbot-china-connect.md`](cursor/report/astrbot-china-connect.md).

Category slugs are a contract with the Import page filter chips — a row in a
category no chip filters is unreachable in the UI, and `test_catalog_search.py`
fails if the two drift apart.

## What `authType` means for revoke

`authType` also decides what a reconnect can do. `nango` and `astrbot` grants
live at the provider, so revoking destroys them and reconnect must walk the
connect flow again. `api_key` and `mcp_url` connectors have nothing upstream to
rebuild, so reconnect simply re-enables them. See `docs/api-contracts.md`.

Frontend icons live in `frontend/src/shared/js/app-runtime.js` (`sourceAdapterIcon`).

## Bulk proof (Dev2)

```powershell
cd backend
$env:PYTHONPATH = (Get-Location).Path
python scripts/bulk_register_mcp.py
```

Loads N definitions from `scripts/fixtures/mcp_connectors.json` into the MCP registry. Expected line: `added 12 connectors without new routers`.

Vertical slice (mock):

```powershell
python scripts/smoke_vertical_slice.py
```

Covers Dev1 HTTP (login/catalog/connect/sources/overview) plus Nango connect URL + MCP register + Telegram/AstrBot source + memory store/recall + AgentService/Harness run.
