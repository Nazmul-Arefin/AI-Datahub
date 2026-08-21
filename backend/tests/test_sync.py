"""Tests for Notion/source sync via Nango proxy facade."""

from __future__ import annotations

import pytest

from app.adapters.nango.client import NangoClient
from app.services.sync_service import SyncService


class _FakeNango:
    mode = "mock"
    secret_key = ""

    async def resolve_connection_id(self, stored, provider_config_key):
        return stored or "mock-conn"

    async def proxy(self, *args, **kwargs):
        raise AssertionError("mock mode should not call proxy")


@pytest.mark.asyncio
async def test_sync_source_mock_persists_assets(client):
    response = await client.post("/api/v1/sources/notion/sync")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["fetched"] >= 1
    assert body["source"]["id"] == "notion"
    assert "page" in body["source"]["assets"].lower()
    assert body["items"]
    assert "synced_assets" in body["storage"].lower() or "Postgres" in body["storage"]

    listed = await client.get("/api/v1/sources/notion/synced-assets")
    assert listed.status_code == 200
    payload = listed.json()
    assert payload["total"] >= 1
    assert payload["items"][0]["title"]


@pytest.mark.asyncio
async def test_finish_connect_keeps_full_connection_id():
    client = NangoClient(mode="mock", secret_key="")
    result = await client.finish_connect("d627d4db-c951-43ab-a96b-7841eaa30cde", "nango-notion-abc")
    assert result["externalConnectionId"] == "d627d4db-c951-43ab-a96b-7841eaa30cde"
    assert result["credentialRef"] == result["externalConnectionId"]


@pytest.mark.asyncio
async def test_sync_google_calendar_mock(client):
    response = await client.post("/api/v1/sources/calendar/sync")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["fetched"] >= 1
    assert body["source"]["id"] == "calendar"
    assert body["items"]
    assert body["items"][0]["objectType"] == "calendar_event"
