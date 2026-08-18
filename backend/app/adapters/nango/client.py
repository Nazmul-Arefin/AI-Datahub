"""Nango OAuth connector — Elastic license; see docs/licenses.md."""

from app.core.config import settings


class NangoClient:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or settings.nango_url

    async def create_connect_session(self, integration_id: str, redirect_uri: str | None) -> dict:
        return {
            "authorizationUrl": f"{self.base_url}/oauth/connect/{integration_id}",
            "state": f"nango-{integration_id}",
        }


nango_client = NangoClient()
