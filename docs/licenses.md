# Third-party licenses

Review before shipping adapter integrations.

| Component | License | Notes |
|-----------|---------|-------|
| AstrBot | **AGPL-3.0** | Network use may require source disclosure — confirm with legal |
| Nango | **Elastic License 2.0** | Restrictions on managed SaaS competition — confirm deployment model |
| FastAPI / SQLAlchemy | MIT / MIT | Standard dependencies |

Keep adapter code in isolated packages under `backend/app/adapters/` for auditability.
