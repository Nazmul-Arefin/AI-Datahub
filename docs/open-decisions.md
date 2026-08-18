# Open decisions

Track unresolved architecture choices here.

| Topic | Options | Status |
|-------|---------|--------|
| Repo layout | UI at root vs `frontend/` subfolder | **`frontend/`** (adopted) |
| Auth | JWT vs session cookies | JWT stub in place |
| Real-time missions | SSE vs WebSocket vs polling | TBD |
| Worker queue | Celery vs RQ vs arq | TBD |
| File storage | S3 vs local FS adapter | `storage_fs` stub |
| Multi-user | Single-user dev vs tenant model | Single-user dev |

Update this file when a decision is made.
