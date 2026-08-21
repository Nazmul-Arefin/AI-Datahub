import pytest

from app.adapters.coze_workflow.client import build_goal_image_prompt, extract_image_url
from app.core import config
from app.schemas.goals import GoalCreateRequest
from app.services import goal_artwork_job
from app.services.goal_service import goal_service
from app.services.runtime_store import runtime_store


def test_build_goal_image_prompt_includes_subject_and_style():
    prompt = build_goal_image_prompt(
        title="Run a half marathon",
        category="Wellbeing",
        description="Morning training in the park",
    )
    lower = prompt.lower()
    assert "Run a half marathon" in prompt
    assert "ai os" in lower
    assert "modern professional" in lower
    assert "avoid text" in lower or "no text" in lower
    assert "purple" in lower
    assert "Morning training in the park" in prompt
    assert len(prompt) <= 720
    # Brand constraints must not be truncated away.
    assert "cartoon mascots" in lower
    assert "coral-orange" in lower or "coral" in lower


def test_extract_image_url_from_markdown_and_raw():
    assert extract_image_url("![cover](https://cdn.example.com/a.png)") == "https://cdn.example.com/a.png"
    assert extract_image_url("see https://img.example.com/x.jpg?x=1 now") == "https://img.example.com/x.jpg?x=1"
    assert extract_image_url("https://lf3-static.bytednsdoc.com/obj/photo") is not None
    assert extract_image_url("no image here") is None


@pytest.mark.asyncio
async def test_create_goal_idle_when_coze_disabled(client, monkeypatch):
    monkeypatch.setattr(config.settings, "coze_mode", "mock")
    monkeypatch.setattr(config.settings, "coze_api_token", "")
    response = await client.post(
        "/api/v1/goals",
        json={"title": "Ship the cover", "category": "Project", "description": "Launch demo"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["imageStatus"] == "idle"
    assert body.get("imageUrl") in (None, "")


@pytest.mark.asyncio
async def test_create_goal_generates_artwork_in_background(client, monkeypatch):
    monkeypatch.setattr(config.settings, "coze_mode", "live")
    monkeypatch.setattr(config.settings, "coze_api_token", "test-token")
    monkeypatch.setattr(config.settings, "coze_workflow_id", "wf-test")

    def fake_generate(prompt: str):
        assert isinstance(prompt, str) and len(prompt) > 10
        return "https://cdn.example.com/goal-cover.png"

    monkeypatch.setattr(goal_artwork_job, "generate_goal_image", fake_generate)

    response = await client.post(
        "/api/v1/goals",
        json={"title": "Ship the cover", "category": "Project", "description": "Launch demo"},
    )
    assert response.status_code == 201
    body = response.json()
    goal_id = body["id"]
    assert body["imageStatus"] == "generating"

    goal_artwork_job.run_goal_artwork_job(goal_id)

    fetched = await client.get(f"/api/v1/goals/{goal_id}")
    assert fetched.status_code == 200
    data = fetched.json()
    assert data["imageStatus"] == "ready"
    assert data["imageUrl"] == "https://cdn.example.com/goal-cover.png"


@pytest.mark.asyncio
async def test_artwork_job_marks_failed_when_no_url(client, monkeypatch):
    monkeypatch.setattr(config.settings, "coze_mode", "live")
    monkeypatch.setattr(config.settings, "coze_api_token", "test-token")
    monkeypatch.setattr(goal_artwork_job, "generate_goal_image", lambda _prompt: None)

    created = await client.post("/api/v1/goals", json={"title": "No art", "category": "Learning"})
    goal_id = created.json()["id"]
    goal_artwork_job.run_goal_artwork_job(goal_id)
    fetched = await client.get(f"/api/v1/goals/{goal_id}")
    assert fetched.json()["imageStatus"] == "failed"


def test_set_goal_artwork_updates_runtime_store(monkeypatch):
    monkeypatch.setattr(config.settings, "coze_mode", "mock")
    monkeypatch.setattr(config.settings, "coze_api_token", "")
    runtime_store.reset()
    goal = goal_service.create_goal(
        GoalCreateRequest(title="Local art", category="Travel"),
        db=None,
    )
    updated = goal_service.set_goal_artwork(goal.id, "https://cdn.example.com/t.png", "ready", db=None)
    assert updated is not None
    assert updated.image_url == "https://cdn.example.com/t.png"
    assert updated.image_status == "ready"
