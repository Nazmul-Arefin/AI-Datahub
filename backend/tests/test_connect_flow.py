import pytest

from app.schemas.sources import ConnectStartResponse


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
    github = next(item for item in sources.json()["sources"] if item["id"] == "github")
    assert github["statusType"] == "connected"
    assert github["connection"]["status"] == "connected"
    assert github["connection"]["authProvider"] == "nango"

    overview = await client.get("/api/v1/overview")
    labels = [item["label"] for item in overview.json()["activity"]]
    assert any("GitHub" in label or "github" in label.lower() for label in labels)


@pytest.mark.asyncio
async def test_connect_goes_through_auth_connector(client, monkeypatch):
    """Plan 4.2: mock AuthConnector and assert connection + source rows."""
    from app.api import integrations as integrations_api
    from app.services import source_service as source_module

    started: dict[str, str] = {}

    async def fake_start(integration_key, redirect_uri, user_id, state):
        started["key"] = integration_key
        started["state"] = state
        return ConnectStartResponse(
            authorizationUrl=f"https://nango.test/oauth/{integration_key}?state={state}",
            state=state,
        )

    async def fake_exchange(code, state, user_id=None):
        started["code"] = code
        return {
            "accessToken": "mock-token",
            "provider": "nango",
            "externalConnectionId": "nango-ext-1",
        }

    monkeypatch.setattr(source_module.auth_connector, "start_authorization", fake_start)
    monkeypatch.setattr(integrations_api.auth_connector, "exchange_code", fake_exchange)

    start = await client.post(
        "/api/v1/integrations/connect",
        json={"integrationId": "linear", "redirectUri": "/done"},
    )
    assert start.status_code == 200
    assert started["key"] == "linear"
    assert start.json()["authorizationUrl"].startswith("https://nango.test/oauth/linear")

    callback = await client.get(
        "/api/v1/integrations/callback",
        params={"code": "nango-ok", "state": start.json()["state"]},
        follow_redirects=False,
    )
    assert callback.status_code in {200, 302, 307}

    linear = next(
        item for item in (await client.get("/api/v1/sources")).json()["sources"] if item["id"] == "linear"
    )
    assert linear["connection"]["externalConnectionId"] == "nango-ext-1"
    assert linear["connection"]["status"] == "connected"
    assert started["code"] == "nango-ok"


@pytest.mark.asyncio
async def test_astrbot_catalog_connect_returns_url(client):
    start = await client.post("/api/v1/integrations/telegram/connect")
    assert start.status_code == 200
    body = start.json()
    assert body["authorizationUrl"]
    assert body["state"]
    assert body.get("setupRequired") is False


@pytest.mark.asyncio
async def test_china_astrbot_catalog_rows_are_ready(client):
    catalog = await client.get("/api/v1/integrations/catalog")
    assert catalog.status_code == 200
    by_id = {item["id"]: item for item in catalog.json()["items"]}
    for key in ("feishu", "dingtalk", "wecom", "qq", "wecom-ai"):
        assert key in by_id, key
        assert by_id[key]["authType"] == "astrbot", key
        assert by_id[key]["method"] == "AstrBot", key

    start = await client.post("/api/v1/integrations/feishu/connect")
    assert start.status_code == 200
    body = start.json()
    assert body["state"]
    assert body.get("authorizationUrl") or body.get("setupUrl")


@pytest.mark.asyncio
async def test_invalid_callback_state(client):
    response = await client.get("/api/v1/integrations/callback", params={"code": "x", "state": "missing"})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "bad_request"
