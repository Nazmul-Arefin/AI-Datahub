import pytest


@pytest.mark.asyncio
async def test_catalog_lists_seed_entries(client):
    response = await client.get("/api/v1/integrations/catalog")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 12
    keys = {item["id"] for item in data["items"]}
    assert "google-calendar" in keys
    assert "telegram" in keys
    assert "discord" in keys


@pytest.mark.asyncio
async def test_catalog_search_by_query(client):
    response = await client.get("/api/v1/integrations/catalog", params={"q": "calendar"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all("calendar" in item["name"].lower() or "calendar" in item["id"] for item in data["items"])


@pytest.mark.asyncio
async def test_catalog_filter_by_category(client):
    response = await client.get("/api/v1/integrations/catalog", params={"category": "communication"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert {item["category"] for item in data["items"]} == {"communication"}
    auth_types = {item["authType"] for item in data["items"]}
    assert "astrbot" in auth_types
