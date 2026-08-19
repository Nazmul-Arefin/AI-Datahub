import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_root_health_alias(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_list_goals(client):
    response = await client.get("/api/v1/goals")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["goals"]) >= 1


@pytest.mark.asyncio
async def test_list_sources(client):
    response = await client.get("/api/v1/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_docs_does_not_slash_redirect(client):
    for path in ("/docs", "/docs/"):
        response = await client.get(path, follow_redirects=False)
        assert response.status_code == 200, path
        assert "text/html" in response.headers.get("content-type", "")
