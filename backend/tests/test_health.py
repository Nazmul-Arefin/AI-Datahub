import pytest


REQUIRED_SIDECARS = {"harness", "astrbot", "nango", "memory"}


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_root_health_alias(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_sidecar_health_lists_required_sidecars(client):
    response = await client.get("/api/v1/health/sidecars")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in {"ok", "degraded"}
    names = {item["name"] for item in data["sidecars"]}
    assert REQUIRED_SIDECARS <= names
    for item in data["sidecars"]:
        assert item["mode"] in {"mock", "live"}
        assert item["status"] in {"ok", "down"}
        assert "url" in item


class _FakePingClient:
    def __init__(self, results: dict[str, tuple[bool, str]]) -> None:
        self._results = results

    async def ping(self, url: str, timeout_seconds: float) -> tuple[bool, str]:
        return self._results.get(url, (False, "missing"))


@pytest.mark.asyncio
async def test_sidecar_health_service_ok_when_all_pings_succeed():
    from app.core.config import Settings
    from app.services.sidecar_health_service import SidecarHealthService

    settings = Settings(
        nango_url="http://nango.test",
        memory_service_url="http://memory.test",
        agent_harness_url="http://harness.test",
        astrbot_url="http://astrbot.test",
        mcp_gateway_url="http://mcp.test",
        harness_mode="mock",
        astrbot_mode="live",
        nango_mode="mock",
        memory_mode="mock",
        mcp_gateway_mode="mock",
    )
    client = _FakePingClient(
        {
            "http://nango.test": (True, "http 200"),
            "http://memory.test": (True, "http 200"),
            "http://harness.test": (True, "http 200"),
            "http://astrbot.test": (True, "http 200"),
            "http://mcp.test": (True, "http 200"),
        }
    )
    service = SidecarHealthService(client=client, settings=settings)
    result = await service.check_all()
    assert result.status == "ok"
    by_name = {item.name: item for item in result.sidecars}
    assert by_name["astrbot"].mode == "live"
    assert all(item.status == "ok" for item in result.sidecars)


@pytest.mark.asyncio
async def test_list_goals(client):
    response = await client.get("/api/v1/goals")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["goals"]) >= 1


@pytest.mark.asyncio
async def test_list_sources(client):
    response = await client.get("/api/v1/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_docs_does_not_slash_redirect(client):
    for path in ("/docs", "/docs/"):
        response = await client.get(path, follow_redirects=False)
        assert response.status_code == 200, path
        assert "text/html" in response.headers.get("content-type", "")
