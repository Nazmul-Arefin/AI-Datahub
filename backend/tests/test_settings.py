import pytest

from app.services.settings_service import settings_service


@pytest.fixture
def isolated_settings(tmp_path, monkeypatch):
    monkeypatch.setattr(
        "app.services.settings_service._SETTINGS_DIR",
        tmp_path / "settings",
    )
    settings_service.clear_cache()
    yield
    settings_service.clear_cache()


@pytest.mark.asyncio
async def test_settings_defaults_and_patch(client, isolated_settings):
    response = await client.get("/api/v1/settings")
    assert response.status_code == 200
    data = response.json()
    assert data["autonomy"] == "prepare"
    assert data["confirmMemory"] is True
    assert data["showActivityDock"] is True
    assert data["reduceMotion"] is False

    patched = await client.patch(
        "/api/v1/settings",
        json={
            "autonomy": "assist",
            "reduceMotion": True,
            "showActivityDock": False,
        },
    )
    assert patched.status_code == 200
    body = patched.json()
    assert body["autonomy"] == "assist"
    assert body["reduceMotion"] is True
    assert body["showActivityDock"] is False
    assert body["confirmMemory"] is True

    again = await client.get("/api/v1/settings")
    assert again.status_code == 200
    assert again.json()["autonomy"] == "assist"
    assert again.json()["reduceMotion"] is True


@pytest.mark.asyncio
async def test_settings_survive_service_reload(client, isolated_settings):
    patched = await client.patch(
        "/api/v1/settings",
        json={"autonomy": "monitor", "compactActivity": True},
    )
    assert patched.status_code == 200
    assert patched.json()["autonomy"] == "monitor"

    settings_service.clear_cache()
    again = await client.get("/api/v1/settings")
    assert again.status_code == 200
    body = again.json()
    assert body["autonomy"] == "monitor"
    assert body["compactActivity"] is True
