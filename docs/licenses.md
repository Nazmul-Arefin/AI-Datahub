# Third-party licenses

Isolation (sidecars + adapters) keeps the FastAPI core replaceable and makes AGPL/Elastic boundaries clearer for counsel. Legal must sign off before commercial images that redistribute covered source.

| Component | License | Packaging note |
|-----------|---------|----------------|
| DeepSeek Harness | MIT | OK for commercial redistribution |
| TencentDB Agent Memory | MIT | OK |
| FastAPI / SQLAlchemy | MIT | Standard dependencies |
| **AstrBot** | **AGPL-3.0** | Boss-required. Run as **isolated sidecar** (HTTP API only). Network use / redistribution may trigger source obligations. Do not vendor AstrBot into the FastAPI image. |
| **Nango** | **Elastic License** | Boss-required for scale. Self-host free has limited features; Cloud/EE for the full provider set. Isolate as sidecar. Track free vs EE as an open packaging decision. |

Adapter code lives under `backend/app/adapters/`. Product routers never import these SDKs.

Open packaging items: [open-decisions.md](open-decisions.md).
