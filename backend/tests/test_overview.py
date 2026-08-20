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
    tomorrow = [item for item in tasks if item["dayOffset"] == 1]
    assert len(tomorrow) >= 3
    day_two = [item for item in tasks if item["dayOffset"] == 2]
    assert len(day_two) >= 2
    day_three = [item for item in tasks if item["dayOffset"] == 3]
    assert len(day_three) >= 2
    for item in tasks:
        assert item["id"]
        assert item["title"]
        assert item["owner"] in {"human", "ai"}
        assert "dayOffset" in item
