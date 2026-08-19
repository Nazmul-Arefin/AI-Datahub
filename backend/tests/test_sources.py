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
async def test_disconnect_and_reconnect_source(client):
    revoked = await client.post("/api/v1/sources/notion/disconnect")
    assert revoked.status_code == 200
    body = revoked.json()
    assert body["statusType"] == "revoked"
    assert body["aiEnabled"] is False

    restored = await client.post("/api/v1/sources/notion/reconnect")
    assert restored.status_code == 200
    assert restored.json()["statusType"] == "connected"
    assert restored.json()["aiEnabled"] is True
