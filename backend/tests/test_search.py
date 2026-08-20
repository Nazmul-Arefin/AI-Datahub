import pytest


@pytest.mark.asyncio
async def test_search_finds_seed_goal(client):
    response = await client.get("/api/v1/search", params={"q": "Beijing"})
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "Beijing"
    assert data["total"] >= 1
    types = {item["type"] for item in data["items"]}
    assert "goal" in types
    titles = " ".join(item["title"] for item in data["items"]).lower()
    assert "beijing" in titles


@pytest.mark.asyncio
async def test_search_empty_query(client):
    response = await client.get("/api/v1/search", params={"q": ""})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []
