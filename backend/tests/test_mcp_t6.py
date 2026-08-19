"""T6: MCP registry + invoke never leak secrets; AgentService lists tools only."""

from __future__ import annotations

import json

import pytest

from app.adapters.mcp_gateway.client import McpGatewayClient
from app.services.agent_service import AgentService
from app.services.mcp_service import McpService

TOKEN_KEYS = {"accessToken", "access_token", "refreshToken", "refresh_token", "token"}


def _assert_no_secrets(payload: object) -> None:
    blob = json.dumps(payload)
    for key in TOKEN_KEYS:
        assert f'"{key}"' not in blob
    if isinstance(payload, dict):
        assert TOKEN_KEYS.isdisjoint(payload.keys())
        assert "credentialRef" not in payload
        for value in payload.values():
            _assert_no_secrets(value)
    elif isinstance(payload, list):
        for item in payload:
            _assert_no_secrets(item)


@pytest.mark.asyncio
async def test_register_from_connection_lists_tools_and_invokes(tmp_path):
    service = McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "mcp_audit.jsonl"))
    registered = await service.register(
        connection_id="conn-github-1",
        name="github",
        tools=[{"name": "list_repos", "description": "List repos", "accessToken": "should-not-store"}],
        credential_ref="cred_github_test",
    )
    assert registered["serverId"]
    assert registered["connectionId"] == "conn-github-1"
    _assert_no_secrets(registered)

    tools = await service.list_tools(registered["serverId"])
    names = {item["name"] for item in tools["tools"]}
    assert "list_repos" in names
    _assert_no_secrets(tools)

    invoked = await service.invoke(
        "list_repos",
        {"org": "acme", "accessToken": "leak-me"},
        server_id=registered["serverId"],
    )
    assert invoked["ok"] is True
    assert invoked["tool"] == "list_repos"
    assert invoked["result"]["repos"]
    assert invoked["auditId"]
    _assert_no_secrets(invoked)

    audit = await service.list_audit()
    assert audit["total"] >= 1
    assert audit["sink"] == "local_file"
    _assert_no_secrets(audit)
    assert (tmp_path / "mcp_audit.jsonl").exists()


@pytest.mark.asyncio
async def test_audit_sink_is_sidecar_in_live_mode():
    from app.core.config import Settings

    class _LiveAudit:
        mode = "live"

        async def list_audit(self):
            return [{"id": "aud-1", "ok": True}]

    service = McpService(client=_LiveAudit(), settings=Settings(mcp_gateway_mode="live"))
    audit = await service.list_audit()
    assert audit["sink"] == "sidecar"
    assert audit["total"] == 1


@pytest.mark.asyncio
async def test_agent_service_lists_allowed_tools_without_tokens(tmp_path):
    mcp = McpService(client=McpGatewayClient(mode="mock", audit_path=tmp_path / "mcp_audit.jsonl"))
    await mcp.register(connection_id="conn-2", name="github")
    listed = await AgentService(mcp=mcp).list_allowed_tools()
    names = {item["name"] for item in listed["tools"]}
    assert "list_repos" in names
    _assert_no_secrets(listed)


@pytest.mark.asyncio
async def test_mcp_http_register_list_invoke(client):
    registered = await client.post(
        "/api/v1/mcp/register",
        json={"connectionId": "conn-http-1", "name": "github"},
    )
    assert registered.status_code == 200
    body = registered.json()
    server_id = body["serverId"]
    assert "accessToken" not in json.dumps(body)

    tools = await client.get(f"/api/v1/mcp/servers/{server_id}/tools")
    assert tools.status_code == 200
    names = {item["name"] for item in tools.json()["tools"]}
    assert "list_repos" in names

    invoked = await client.post(
        "/api/v1/mcp/invoke",
        json={"tool": "list_repos", "args": {"org": "acme"}, "serverId": server_id},
    )
    assert invoked.status_code == 200
    payload = invoked.json()
    assert payload["ok"] is True
    assert "accessToken" not in json.dumps(payload)

    allowed = await client.get("/api/v1/agents/tools")
    assert allowed.status_code == 200
    listed_names = {item["name"] for item in allowed.json()["tools"]}
    assert "list_repos" in listed_names
    assert "credentialRef" not in json.dumps(allowed.json())
