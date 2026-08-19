# Open decisions

Still open for **packaging / production**, not whether to include the components. Team plan: [plan.md](../plan.md).

| Topic | Options | Status |
|-------|---------|--------|
| Where the LLM runs | Local weights vs `api.deepseek.com` | **Locked:** cloud API `deepseek-v4-pro` at `https://api.deepseek.com` |
| Sidecar hosting | Cloud SaaS vs Compose on this machine | **Locked:** AstrBot, Nango, TencentDB Agent Memory, Harness run **locally in Compose** |
| AstrBot image | | **Locked for wiring:** `soulter/astrbot:latest` (WebUI :6185) |
| Nango image | Cloud vs official self-host | **Locked:** official self-host in Compose (not Nango Cloud) |
| TencentDB Agent Memory image | Tencent Cloud vs local container | **Open:** need exact self-host image/repo — no Tencent Cloud API |
| Nango packaging | Free self-host vs paid EE for 900+ providers | **Open** for production packaging; sprint uses self-host + mock until wired |
| AstrBot AGPL | Compliance process for commercial distribution | **Open** — sidecar isolation required; legal before ship |
| MCP gateway process | In-process Day 5 vs dedicated process later | **Sprint:** in-process via `MCPService` / gateway adapter |
| RAG | Qdrant + LlamaIndex vs none | **Post-sprint** — `KnowledgeService` stub only |
| Memory stores | TencentDB only vs Postgres `memories` + TD recall | **Sprint:** dual — Postgres UI (Dev1) + local memory sidecar (Dev2) |
| VPS sizing | Estimate 4 vCPU / 16 GB RAM / 60+ GB with all sidecars | **Validate on demo hardware** |
| Real-time missions | SSE vs WebSocket vs polling | TBD after vertical slice |
| Auth | Single-user JWT admin | **Locked** for 5-day sprint |

Update this file when a decision is made. Do not “simplify” by dropping AstrBot or Nango without updating architecture and boss-facing docs.
