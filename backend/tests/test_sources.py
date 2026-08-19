import pytest


@pytest.mark.asyncio
async def test_list_sources_matches_import_ui(client):
    response = await client.get("/api/v1/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 12


@pytest.mark.asyncio
async def test_list_sources_by_category(client):
    response = await client.get("/api/v1/sources", params={"category": "device"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 3
    assert all(source["category"] == "device" for source in data["sources"])


@pytest.mark.asyncio
async def test_disconnect_blocks_ai_and_revokes_the_grant(client):
    revoked = await client.post("/api/v1/sources/notion/disconnect")
    assert revoked.status_code == 200
    body = revoked.json()
    assert body["statusType"] == "revoked"
    assert body["aiEnabled"] is False
    assert body["connection"]["status"] == "revoked"
    assert body["connection"]["errorMessage"] is None


@pytest.mark.asyncio
async def test_reconnect_requires_reauthorization_after_a_revoked_oauth_grant(client):
    await client.post("/api/v1/sources/notion/disconnect")

    restarted = await client.post("/api/v1/sources/notion/reconnect", json={"redirectUri": "/back"})
    assert restarted.status_code == 200
    body = restarted.json()

    # Revoking destroyed the Nango grant, so access has to be granted again.
    # Flipping the status back to connected would claim access we do not have.
    assert body["reauthorizationRequired"] is True
    assert body["authorizationUrl"]
    assert body["state"]
    assert body["statusType"] == "attention"
    assert body["aiEnabled"] is False


@pytest.mark.asyncio
async def test_completing_reauthorization_restores_access(client):
    await client.post("/api/v1/sources/notion/disconnect")
    restarted = (await client.post("/api/v1/sources/notion/reconnect")).json()

    await client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": restarted["state"]},
        follow_redirects=False,
    )

    notion = (await client.get("/api/v1/sources/notion")).json()
    assert notion["statusType"] == "connected"
    assert notion["aiEnabled"] is True
    assert notion["connection"]["status"] == "connected"


@pytest.mark.asyncio
async def test_reconnect_restores_a_local_source_without_reauthorization(client):
    # A local device bridge has no third-party grant to rebuild, so reconnect is
    # a straight re-enable with no authorization round trip.
    await client.post("/api/v1/sources/iphone/disconnect")

    restored = (await client.post("/api/v1/sources/iphone/reconnect")).json()
    assert restored["reauthorizationRequired"] is False
    assert restored["authorizationUrl"] is None
    assert restored["statusType"] == "connected"
    assert restored["aiEnabled"] is True


@pytest.mark.asyncio
async def test_failed_provider_revoke_is_reported_and_tools_still_dropped(client, monkeypatch):
    from app.services import source_service as module

    unregistered: list[str] = []

    async def failing_revoke(_connection_id: str) -> None:
        raise RuntimeError("provider unreachable")

    async def track_unregister(connection_id: str) -> None:
        unregistered.append(connection_id)

    monkeypatch.setattr(module.auth_connector, "revoke", failing_revoke)
    monkeypatch.setattr(module.mcp_service, "unregister", track_unregister)

    body = (await client.post("/api/v1/sources/notion/disconnect")).json()

    # Local access is blocked either way, but the failure must be visible rather
    # than reported as a clean revoke.
    assert body["aiEnabled"] is False
    assert body["connection"]["status"] == "revoked"
    assert "provider unreachable" in body["connection"]["errorMessage"]
    # A failing provider call must not leave tools registered for agents to call.
    assert unregistered == [body["connectionId"]]


@pytest.mark.asyncio
async def test_reconnect_reports_a_failed_token_refresh(client, monkeypatch):
    from app.services import source_service as module

    async def failing_refresh(_connection_id: str) -> dict[str, str]:
        raise RuntimeError("token endpoint down")

    monkeypatch.setattr(module.auth_connector, "refresh", failing_refresh)

    # Calendar's grant is still live, so reconnect refreshes it instead of
    # restarting the connect flow.
    body = (await client.post("/api/v1/sources/calendar/reconnect")).json()
    assert body["statusType"] == "attention"
    assert body["aiEnabled"] is False
    assert body["connection"]["status"] == "error"
    assert "token endpoint down" in body["connection"]["errorMessage"]


@pytest.mark.asyncio
async def test_seeded_sources_expose_connection_state(client):
    sources = (await client.get("/api/v1/sources")).json()["sources"]
    by_id = {source["id"]: source for source in sources}

    # Seeded sources that came through an integration carry an authorization record.
    connected = by_id["notion"]
    assert connected["connectionId"]
    assert connected["connection"]["id"] == connected["connectionId"]
    assert connected["connection"]["status"] == "connected"
    assert connected["connection"]["authProvider"] == "nango"

    # Local sources have no external authorization to report.
    assert by_id["iphone"]["connectionId"] is None
    assert by_id["iphone"]["connection"] is None


@pytest.mark.asyncio
async def test_reconnect_refreshes_a_grant_that_is_still_live(client):
    # No disconnect first: the grant is intact, so reconnect re-validates it with
    # the provider and stamps a fresh connection time.
    restored = (await client.post("/api/v1/sources/calendar/reconnect")).json()
    assert restored["reauthorizationRequired"] is False
    assert restored["connection"]["status"] == "connected"
    assert restored["connection"]["connectedAt"]


@pytest.mark.asyncio
async def test_new_connection_appears_on_source(client):
    start = await client.post(
        "/api/v1/integrations/connect",
        json={"integrationId": "slack", "redirectUri": "/done"},
    )
    await client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": start.json()["state"]},
        follow_redirects=False,
    )

    sources = (await client.get("/api/v1/sources")).json()["sources"]
    slack = next(source for source in sources if source["id"] == "slack")
    assert slack["connection"]["status"] == "connected"
    assert slack["connection"]["authProvider"] == "nango"
    assert slack["connection"]["externalConnectionId"]


@pytest.mark.asyncio
async def test_astrbot_connection_reports_its_provider(client):
    start = await client.post("/api/v1/integrations/telegram/connect")
    await client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": start.json()["state"]},
        follow_redirects=False,
    )

    sources = (await client.get("/api/v1/sources")).json()["sources"]
    telegram = next((source for source in sources if source["id"] == "telegram"), None)
    assert telegram is not None
    assert telegram["connection"]["status"] == "connected"
