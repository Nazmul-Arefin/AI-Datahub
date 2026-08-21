"""Load Import Data connectors from fixtures/connectors.json into the catalog.

Keeps the seed list data-driven so China + global cards scale without
editing Python or wiring Nango one-by-one.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.schemas.sources import IntegrationCatalogItem

FIXTURE_PATH = Path(__file__).resolve().parents[1] / "fixtures" / "connectors.json"

_METHOD_BY_AVAILABILITY = {
    "live": "Live",
    "api_key": "API key",
    "mcp_url": "MCP URL",
    "astrbot": "AstrBot",
    "coming_soon": "Coming soon",
}


def _item_from_dict(raw: dict) -> IntegrationCatalogItem:
    availability = str(raw.get("availability") or "coming_soon").strip().lower()
    auth_type = str(raw.get("auth_type") or "api_key").strip().lower()
    if auth_type not in {"nango", "astrbot", "api_key", "mcp_url"}:
        auth_type = "api_key"

    nango_key = raw.get("nango_provider_key")
    # Only live Nango rows keep auth_type=nango (starts Connect UI).
    # Coming-soon OAuth targets stay api_key so Connect is a soft no-op toast path.
    if availability == "coming_soon" and auth_type == "nango":
        auth_type = "api_key"

    method = str(raw.get("method") or "").strip() or _METHOD_BY_AVAILABILITY.get(availability, "Coming soon")
    region = str(raw.get("region") or "global").strip().lower()
    description = str(raw.get("description") or "").strip()
    if region == "cn" and description and not description.startswith("["):
        description = f"[中国] {description}"

    scopes = raw.get("scopes") or ["Selected data"]
    if not isinstance(scopes, list):
        scopes = [str(scopes)]

    return IntegrationCatalogItem(
        id=str(raw["id"]),
        name=str(raw.get("name") or raw["id"]),
        category=str(raw.get("category") or "productivity"),
        method=method,
        description=description or None,
        scopes=[str(s) for s in scopes],
        authType=auth_type,
        nangoProviderKey=str(nango_key) if nango_key and auth_type == "nango" else None,
        logoUrl=raw.get("logo_url"),
    )


@lru_cache(maxsize=1)
def load_connectors_catalog() -> tuple[IntegrationCatalogItem, ...]:
    if not FIXTURE_PATH.exists():
        return tuple()
    data = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    rows = data.get("connectors", data) if isinstance(data, dict) else data
    items: list[IntegrationCatalogItem] = []
    seen: set[str] = set()
    for raw in rows:
        if not isinstance(raw, dict) or not raw.get("id"):
            continue
        key = str(raw["id"])
        if key in seen:
            continue
        seen.add(key)
        items.append(_item_from_dict(raw))
    return tuple(items)


def merge_catalog(base: list[IntegrationCatalogItem]) -> list[IntegrationCatalogItem]:
    """Fixture fills the catalog; explicit base seed overrides on id collision."""
    by_id = {item.id: item for item in load_connectors_catalog()}
    for item in base:
        by_id[item.id] = item
    return sorted(by_id.values(), key=lambda i: (0 if i.method == "Live" else 1, i.name.lower()))
