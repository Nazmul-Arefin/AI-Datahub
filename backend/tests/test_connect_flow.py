import pytest


@pytest.mark.asyncio
async def test_nango_connect_callback_creates_source(client):
    start = await client.post(
        "/api/v1/integrations/connect",
        json={"integrationId": "github", "redirectUri": "/connected"},
    )
    assert start.status_code == 200
    payload = start.json()
    assert "authorizationUrl" in payload
    assert payload["state"]

    callback = await client.get(
        "/api/v1/integrations/callback",
        params={"code": "dev-ok", "state": payload["state"]},
        follow_redirects=False,
    )
    assert callback.status_code in {200, 307, 302}

    sources = await client.get("/api/v1/sources")
    ids = {item["id"] for item in sources.json()["sources"]}
    assert "github" in ids

    overview = await client.get("/api/v1/overview")
    labels = [item["label"] for item in overview.json()["activity"]]
    assert any("GitHub" in label or "github" in label.lower() for label in labels)


@pytest.mark.asyncio
async def test_astrbot_catalog_connect_returns_url(client):
    start = await client.post("/api/v1/integrations/telegram/connect")
    assert start.status_code == 200
    assert start.json()["authorizationUrl"]
    assert start.json()["state"]


@pytest.mark.asyncio
async def test_invalid_callback_state(client):
    response = await client.get("/api/v1/integrations/callback", params={"code": "x", "state": "missing"})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "bad_request"
