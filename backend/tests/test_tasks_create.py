import pytest


@pytest.mark.asyncio
async def test_create_task_appears_in_list_and_activity(client):
    before = await client.get("/api/v1/overview")
    assert before.status_code == 200
    before_activity = before.json().get("activity") or []

    created = await client.post(
        "/api/v1/tasks",
        json={
            "name": "Confirm hotel check-in",
            "dueAt": "+1T09:30",
            "owner": "human",
            "state": "Pending",
        },
    )
    assert created.status_code == 201
    body = created.json()
    assert body["name"] == "Confirm hotel check-in"
    assert body["dueAt"] == "+1T09:30"
    assert body["id"]

    listed = await client.get("/api/v1/tasks")
    assert listed.status_code == 200
    tasks = listed.json()["tasks"]
    assert any(task["id"] == body["id"] for task in tasks)

    overview = await client.get("/api/v1/overview")
    assert overview.status_code == 200
    activity = overview.json().get("activity") or []
    assert len(activity) >= len(before_activity)
    assert any("Task created" in (item.get("label") or "") for item in activity)
