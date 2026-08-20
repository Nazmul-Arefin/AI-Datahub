import pytest


@pytest.mark.asyncio
async def test_overview_live_counts(client):
    response = await client.get("/api/v1/overview")
    assert response.status_code == 200
    data = response.json()
    clusters = {item["key"]: item["count"] for item in data["clusters"]}
    assert clusters["goals"] == 5
    assert clusters["data"] == 12
    assert data["calendarTasks"]
    assert data["activity"]


@pytest.mark.asyncio
async def test_overview_calendar_lists_all_you_and_ai_tasks(client):
    response = await client.get("/api/v1/overview")
    assert response.status_code == 200
    tasks = response.json()["calendarTasks"]
    assert len(tasks) > 3
    owners = {item["owner"] for item in tasks}
    assert "human" in owners
    assert "ai" in owners
    today = [item for item in tasks if item["dayOffset"] == 0]
    assert len(today) > 3
    for item in tasks:
        assert item["id"]
        assert item["title"]
        assert item["owner"] in {"human", "ai"}
        assert "dayOffset" in item
