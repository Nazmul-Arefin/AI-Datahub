"""T5: live Nango Connect session against local nangohq/nango-server."""

from __future__ import annotations

import os
from pathlib import Path

import pytest


def _secret_from_env_file() -> str:
    text = (Path(__file__).resolve().parents[1] / ".env").read_text(encoding="utf-8")
    for line in text.splitlines():
        if line.startswith("NANGO_SECRET_KEY=") and len(line.split("=", 1)[1].strip()) > 8:
            return line.split("=", 1)[1].strip()
    return os.environ.get("NANGO_SECRET_KEY", "")


@pytest.mark.asyncio
async def test_live_nango_returns_connect_ui_url():
    secret = _secret_from_env_file()
    if not secret:
        pytest.skip("NANGO_SECRET_KEY not bootstrapped")

    from app.adapters.nango.client import NangoClient
    from app.services.auth_connector import AuthConnector

    connector = AuthConnector(
        client=NangoClient(
            base_url="http://localhost:3003",
            secret_key=secret,
            connect_url="http://localhost:3009",
            mode="live",
        )
    )
    start = await connector.authorize("github", redirect_uri="http://localhost:8000/api/v1/integrations/callback")
    assert start["mode"] == "live"
    assert "authorizationUrl" in start
    url = start["authorizationUrl"]
    assert "localhost:3009" in url or "connect" in url.lower() or "session" in url.lower()
    assert "accessToken" not in start
    assert "token" not in start
