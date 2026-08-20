import pytest


@pytest.mark.asyncio
async def test_list_goals_includes_seed_profiles(client):
    response = await client.get("/api/v1/goals")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    ids = {goal["id"] for goal in data["goals"]}
    assert {"beijing-trip", "better-self", "spanish-fluency", "financial-resilience", "family-connections"} <= ids


@pytest.mark.asyncio
async def test_patch_goal_progress(client):
    # Progress is derived from subgoal done/total, not a free-standing field.
    response = await client.patch(
        "/api/v1/goals/beijing-trip",
        json={
            "status": "On track",
            "subgoals": [
                {"name": "Flights", "done": 2, "total": 4, "state": "Active"},
                {"name": "Hotel", "done": 1, "total": 2, "state": "Active"},
            ],
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["progress"] == 50
    assert body["status"] == "On track"
    assert body["prediction"]["probability"] >= 8
    assert body["prediction"]["probability"] <= 96


@pytest.mark.asyncio
async def test_goal_metrics_derived_from_subgoals(client):
    response = await client.get("/api/v1/goals/beijing-trip")
    assert response.status_code == 200
    body = response.json()
    done = sum(item["done"] for item in body["subgoals"])
    total = sum(item["total"] for item in body["subgoals"])
    assert body["progress"] == round(done / max(1, total) * 100)
    assert "probability" in body["prediction"]
    assert body["prediction"]["confidence"]


@pytest.mark.asyncio
async def test_patch_goal_status_records_activity(client):
    response = await client.patch("/api/v1/goals/beijing-trip", json={"status": "On track"})
    assert response.status_code == 200
    labels = [item["label"] for item in (await client.get("/api/v1/overview")).json()["activity"]]
    assert any("status updated" in label.lower() for label in labels)


@pytest.mark.asyncio
async def test_create_and_delete_goal(client):
    created = await client.post("/api/v1/goals", json={"title": "Ship the demo", "category": "Project"})
    assert created.status_code == 201
    goal_id = created.json()["id"]
    deleted = await client.delete(f"/api/v1/goals/{goal_id}")
    assert deleted.status_code == 204
    missing = await client.get(f"/api/v1/goals/{goal_id}")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "not_found"


@pytest.mark.asyncio
async def test_list_tasks_filter(client):
    response = await client.get("/api/v1/tasks", params={"goalId": "beijing-trip"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(task["goalId"] == "beijing-trip" for task in data["tasks"])
