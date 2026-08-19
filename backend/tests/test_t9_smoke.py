"""T9: bulk MCP JSON register + vertical-slice smoke exit 0 in mock mode."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"


def _run(script: str) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT)
    env["DEEPSEEK_API_KEY"] = ""
    env["MCP_GATEWAY_MODE"] = "mock"
    env["HARNESS_MODE"] = "mock"
    env["MEMORY_MODE"] = "mock"
    env["ASTRBOT_MODE"] = "mock"
    env["NANGO_MODE"] = "mock"
    return subprocess.run(
        [sys.executable, str(SCRIPTS / script)],
        cwd=str(ROOT),
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )


def test_bulk_register_mcp_adds_connectors_without_new_routers():
    result = _run("bulk_register_mcp.py")
    assert result.returncode == 0, result.stdout + result.stderr
    assert "without new routers" in result.stdout
    assert "added 12" in result.stdout


def test_smoke_vertical_slice_exits_zero():
    result = _run("smoke_vertical_slice.py")
    assert result.returncode == 0, result.stdout + result.stderr
    assert "VERTICAL SLICE ok" in result.stdout
    assert "nango:" in result.stdout
    assert "telegram:" in result.stdout
    assert "memory:" in result.stdout
    assert "run:" in result.stdout


@pytest.mark.asyncio
async def test_openapi_has_no_per_connector_router(client):
    paths = (await client.get("/openapi.json")).json()["paths"]
    assert "/api/v1/mcp/register" in paths
    assert "/api/v1/messaging/{platform}/connect" in paths
    assert not any("/api/v1/connectors/" in path for path in paths)
