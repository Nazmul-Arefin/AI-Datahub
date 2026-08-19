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
