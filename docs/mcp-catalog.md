# MCP connector catalog

How to add a connector without new FastAPI business routers. Day 5 needs this **pipeline**, not 900 live OAuth apps.

Normal Import UX: search catalog → Connect → OAuth/token via Nango or AstrBot → Done. **No raw MCP JSON in the UI path.**

## Add a connector in 3 steps

1. **Catalog row (data only).** Add a JSON object (see `backend/scripts/fixtures/mcp_connectors.json`): `name`, `category` (device / files / productivity / health / communication / identity), `auth_type` (`nango` | `astrbot` | `mcp_url` | `api_key`), plus `nango_provider_key` or `astrbot_platform`, and `mcp_template` / `tools`.
2. **Map auth.** Nango provider **or** AstrBot platform **or** raw MCP URL template. Product code stays `AuthConnector` / `MessagingService` — no new FastAPI business router.
3. **Register on connect.** `MCPService.register` records the server + discovered tools. Agents call tools only through `MCPService` / `AgentService.list_allowed_tools` (never see secrets). High-impact tools set `confirmationRequired: true`. Invoke writes audit events to `backend/data/mcp_audit.jsonl` until Dev1 adds `mcp_audit_events`.

If templates cover auth + tool discovery, **no FastAPI business-logic change**.

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

Covers Nango connect URL + MCP register + Telegram/AstrBot source + memory store/recall + AgentService/Harness run.

## Categories (align with Import UI filters — Dev1 seed)

Device, files, productivity, health, communication, identity — plus messaging via AstrBot.

Frontend icons remain a UI concern (`sourceAdapterIcon`). Do not treat prototype layouts as DB constraints.
