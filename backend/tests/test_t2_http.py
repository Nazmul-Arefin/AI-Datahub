"""T2 OpenAPI surface for Dev2 mock facades."""

import pytest


@pytest.mark.asyncio
async def test_openapi_includes_dev2_mock_paths(client):
    response = await client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/api/v1/agents/runs" in paths
    assert "/api/v1/messaging/platforms" in paths
    assert "/api/v1/messaging/{platform}/connect" in paths
    assert "/api/v1/memories" in paths
    assert "/api/v1/mcp/register" in paths
    assert "/api/v1/mcp/invoke" in paths
    assert "/api/v1/agents/tools" in paths


@pytest.mark.asyncio
async def test_messaging_platforms_and_connect_http(client):
    listed = await client.get("/api/v1/messaging/platforms")
    assert listed.status_code == 200
    ids = {item["id"] for item in listed.json()["platforms"]}
    assert "telegram" in ids

    connected = await client.post("/api/v1/messaging/telegram/connect")
    assert connected.status_code == 200
    body = connected.json()
    assert body["status"] == "connected"
    assert "accessToken" not in body
    assert "credentialRef" in body or "credential_ref" in body


@pytest.mark.asyncio
async def test_memory_crud_http_roundtrip(client):
    created = await client.post(
        "/api/v1/memories",
        json={"title": "Note", "content": "Store this fact"},
    )
    assert created.status_code == 200
    memory_id = created.json()["id"]

    fetched = await client.get(f"/api/v1/memories/{memory_id}")
    assert fetched.status_code == 200
    assert fetched.json()["content"] == "Store this fact"

    deleted = await client.delete(f"/api/v1/memories/{memory_id}")
    assert deleted.status_code == 200

    missing = await client.get("/api/v1/memories/no-such-id")
    assert missing.status_code == 404
