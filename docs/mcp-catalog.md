# MCP connector catalog

How to add a new Import Data connector.

## Steps

1. Add catalog entry in `backend/app/services/seed_data.py` (`INTEGRATION_CATALOG`) or DB catalog table.
2. Register OAuth config in Nango (or device-bridge adapter for local sources).
3. Expose scopes in `IntegrationCatalogItem.scopes`.
4. Implement fetch/sync in `source_service` or a dedicated adapter module.
5. Document in this file and update `docs/api-contracts.md`.

## Categories

- `device` — local bridge (phone, laptop, USB)
- `files` — explicit folder selection
- `productivity` — calendar, Notion, etc.
- `health` — fitness APIs
- `communication` — chat adapters
- `identity` — public discovery tools

Frontend icons live in `frontend/src/shared/js/app-runtime.js` (`sourceAdapterIcon`).
