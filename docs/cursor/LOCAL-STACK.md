# Local stack (locked 2026-08-18, images 2026-08-18)

Everything the product **runs** is on this machine in **one `docker-compose.yml`**, except the DeepSeek **chat model API**.

Start:

```powershell
docker compose --env-file backend/.env up -d --build
```

| Piece | Image / build | Host port | Outbound |
|-------|----------------|-----------|----------|
| FastAPI | `./backend` | 8000 | Compose + `api.deepseek.com` |
| PostgreSQL (app) | `postgres:16-alpine` | 5432 | None |
| **Adminer** (DB web UI) | `adminer:4` | 8088 | None |
| **Nango** | `nangohq/nango-server:hosted` + nango-db + redis | 3003, 3009 | Local Nango only |
| **TencentDB Agent Memory** | `agentmemory/memory-core` + `memory-hub` | 8420, 8125, 8424 | Uses DeepSeek API for embed/summarize |
| **DeepSeek Harness** | build `backend/sidecars/harness` (`npx @deepseek-ai/dsh web`) | 3080 | `api.deepseek.com` |
| **AstrBot** | `soulter/astrbot:latest` | 6185 | Local WebUI |
| MCP gateway | registry sidecar (`mcp_gateway.py`) | 8080 | None (invoke stub; credentials stay inside the gateway) |

Verify (real containers, not mock JSON servers):

```powershell
cd backend
$env:PYTHONPATH = (Get-Location).Path
python scripts/ping_real_sidecars.py
curl http://localhost:8420/health
curl http://localhost:3003
curl http://localhost:3080
curl http://localhost:6185
```

Repos: [TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory) · [nango](https://github.com/NangoHQ/nango) · [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · [AstrBot](https://github.com/AstrBotDevs/AstrBot)
