import re
from pathlib import Path

import pytest

IMPORT_VIEW = (
    Path(__file__).resolve().parents[2] / "frontend" / "src" / "pages" / "import-data" / "view.html"
)


def _ui_filter_slugs() -> set[str]:
    html = IMPORT_VIEW.read_text(encoding="utf-8")
    return set(re.findall(r'data-source-filter="([^"]+)"', html)) - {"all"}


@pytest.mark.asyncio
async def test_catalog_categories_match_the_import_filters(client):
    """Category slugs are a contract with the Import page filter chips.

    A catalog row in a category no chip filters is unreachable in the UI, and a
    chip with no rows behind it is a dead tab, so this asserts both directions.
    """
    if not IMPORT_VIEW.exists():
        pytest.skip("frontend is not present in this checkout")

    items = (await client.get("/api/v1/integrations/catalog")).json()["items"]
    assert {item["category"] for item in items} == _ui_filter_slugs()


@pytest.mark.asyncio
async def test_source_categories_match_the_import_filters(client):
    if not IMPORT_VIEW.exists():
        pytest.skip("frontend is not present in this checkout")

    sources = (await client.get("/api/v1/sources")).json()["sources"]
    assert {source["category"] for source in sources} <= _ui_filter_slugs()


@pytest.mark.asyncio
async def test_catalog_can_fill_every_connect_wizard_tile(client):
    """The wizard offers catalog rows per connection style, falling back to a
    hardcoded pick when a style has none. An empty style is a silent downgrade,
    so the two non-obvious groupings are asserted here."""
    items = (await client.get("/api/v1/integrations/catalog")).json()["items"]

    # "Account or API" offers OAuth/API services across work and health.
    assert [
        item for item in items
        if item["category"] in {"productivity", "health", "communication"}
        and item["authType"] in {"nango", "api_key"}
    ]
    # "Plugin or MCP" offers raw MCP endpoints and MCP-method connectors.
    assert [
        item for item in items
        if item["authType"] == "mcp_url" or "mcp" in (item["method"] or "").lower()
    ]


@pytest.mark.asyncio
async def test_every_catalog_row_declares_an_auth_type(client):
    """Connect routing keys off auth_type, so a missing value silently breaks it."""
    items = (await client.get("/api/v1/integrations/catalog")).json()["items"]
    assert items
    for item in items:
        assert item["authType"] in {"nango", "astrbot", "api_key", "mcp_url"}, item["id"]
        # Nango cannot start an authorization without knowing the provider.
        if item["authType"] == "nango":
            assert item["nangoProviderKey"], item["id"]


@pytest.mark.asyncio
async def test_catalog_lists_seed_entries(client):
    response = await client.get("/api/v1/integrations/catalog")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 100
    keys = {item["id"] for item in data["items"]}
    assert "google-calendar" in keys
    assert "telegram" in keys
    assert "discord" in keys
    assert "notion" in keys
    # China domestic priority set
    assert "wechat" in keys
    assert "dingtalk" in keys
    assert "feishu" in keys
    assert "douyin" in keys
    assert "baidu-netdisk" in keys
    china_ids = {
        "wechat", "wecom", "dingtalk", "feishu", "qq", "weibo", "douyin", "bilibili",
        "xiaohongshu", "zhihu", "baidu-netdisk", "aliyun-drive", "tencent-docs", "yuque",
        "wps", "meituan", "didi", "amap", "alipay", "taobao", "jd", "ctrip", "keep",
        "huawei-health", "coze", "dify", "kimi", "tongyi",
    }
    assert len(china_ids & keys) >= 20


@pytest.mark.asyncio
async def test_catalog_search_by_query(client):
    response = await client.get("/api/v1/integrations/catalog", params={"q": "calendar"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all("calendar" in item["name"].lower() or "calendar" in item["id"] for item in data["items"])


@pytest.mark.asyncio
async def test_catalog_filter_by_category(client):
    response = await client.get("/api/v1/integrations/catalog", params={"category": "communication"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert {item["category"] for item in data["items"]} == {"communication"}
    auth_types = {item["authType"] for item in data["items"]}
    assert "astrbot" in auth_types
    wechat = next(item for item in data["items"] if item["id"] == "wechat")
    assert wechat["authType"] == "astrbot"
    assert wechat["method"] == "AstrBot"
