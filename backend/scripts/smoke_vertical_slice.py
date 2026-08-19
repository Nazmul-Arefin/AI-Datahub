"""Dev1 vertical-slice smoke: login → catalog → connect → sources → overview."""

from __future__ import annotations

import asyncio
import sys

from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.runtime_store import runtime_store


async def run() -> int:
    runtime_store.reset()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login = await client.post("/api/v1/auth/token", json={"username": "admin", "password": "weeple"})
        login.raise_for_status()
        token = login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        catalog = await client.get("/api/v1/integrations/catalog", params={"q": "calendar"}, headers=headers)
        catalog.raise_for_status()
        assert catalog.json()["total"] >= 1

        connect = await client.post(
            "/api/v1/integrations/connect",
            json={"integrationId": "github", "redirectUri": "/done"},
            headers=headers,
        )
        connect.raise_for_status()
        state = connect.json()["state"]

        callback = await client.get(
            "/api/v1/integrations/callback",
            params={"code": "dev-ok", "state": state},
            follow_redirects=False,
        )
        assert callback.status_code in {200, 302, 307}

        sources = await client.get("/api/v1/sources", headers=headers)
        sources.raise_for_status()
        ids = {item["id"] for item in sources.json()["sources"]}
        assert "github" in ids

        overview = await client.get("/api/v1/overview", headers=headers)
        overview.raise_for_status()
        assert overview.json()["activity"]

        print("Dev1 smoke: login, catalog, connect, sources, overview — OK")
        return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(run()))
