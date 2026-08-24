import pytest


async def _register(client, username="nova"):
    response = await client.post(
        "/api/v1/auth/register",
        json={"username": username, "password": "secret12", "displayName": username.title()},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["isNewUser"] is True
    return body["accessToken"]


@pytest.mark.asyncio
async def test_register_workspace_is_empty(client):
    token = await _register(client, "emptyuser")
    headers = {"Authorization": f"Bearer {token}"}

    goals = await client.get("/api/v1/goals", headers=headers)
    assert goals.status_code == 200
    assert goals.json()["total"] == 0
    assert goals.json()["goals"] == []

    overview = await client.get("/api/v1/overview", headers=headers)
    assert overview.status_code == 200
    data = overview.json()
    clusters = {item["key"]: item["count"] for item in data["clusters"]}
    assert clusters["goals"] == 0
    assert clusters["data"] == 0
    assert data["calendarTasks"] == []
    assert data["activity"] == []

    sources = await client.get("/api/v1/sources", headers=headers)
    assert sources.status_code == 200
    assert sources.json()["total"] == 0

    catalog = await client.get("/api/v1/integrations/catalog", headers=headers)
    assert catalog.status_code == 200
    assert len(catalog.json()["items"]) > 0


@pytest.mark.asyncio
async def test_admin_still_sees_mock_seed(client):
    goals = await client.get("/api/v1/goals")
    assert goals.status_code == 200
    assert goals.json()["total"] == 5
    ids = {goal["id"] for goal in goals.json()["goals"]}
    assert "beijing-trip" in ids

    sources = await client.get("/api/v1/sources")
    assert sources.json()["total"] == 13

    overview = await client.get("/api/v1/overview")
    assert overview.json()["calendarTasks"]
    assert overview.json()["activity"]


@pytest.mark.asyncio
async def test_new_user_goals_are_isolated_from_admin(client):
    token = await _register(client, "isolated")
    headers = {"Authorization": f"Bearer {token}"}
    created = await client.post(
        "/api/v1/goals",
        headers=headers,
        json={"title": "Private outcome", "category": "Project"},
    )
    assert created.status_code == 201
    private_id = created.json()["id"]

    mine = await client.get("/api/v1/goals", headers=headers)
    assert {goal["id"] for goal in mine.json()["goals"]} == {private_id}

    admin = await client.get("/api/v1/goals")
    admin_ids = {goal["id"] for goal in admin.json()["goals"]}
    assert private_id not in admin_ids
    assert "beijing-trip" in admin_ids
