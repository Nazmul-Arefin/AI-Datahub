"""In-process MCP registry. Credentials stay internal; never copied into results."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

SECRET_KEYS = frozenset(
    {
        "accessToken",
        "access_token",
        "refreshToken",
        "refresh_token",
        "token",
        "secret",
        "apiKey",
        "api_key",
        "authorization",
        "session_token",
        "sessionToken",
        "password",
        "client_secret",
        "clientSecret",
        "nangoSecretKey",
        "secret_key",
    }
)

GITHUB_TOOLS = [
    {"name": "list_repos", "description": "List repositories for the connected GitHub account"},
    {"name": "get_user", "description": "Get the authenticated GitHub user profile"},
]

_STUB_RESULTS: dict[str, dict[str, Any]] = {
    "list_repos": {"repos": [{"fullName": "acme/demo", "private": False}]},
    "get_user": {"login": "acme", "type": "User"},
    "list_chats": {"chats": [{"id": "chat-1", "title": "Demo"}]},
    "send_message": {"delivered": True},
}


def strip_secrets(payload: Any) -> Any:
    if isinstance(payload, dict):
        return {key: strip_secrets(value) for key, value in payload.items() if key not in SECRET_KEYS}
    if isinstance(payload, list):
        return [strip_secrets(item) for item in payload]
    return payload


def default_tools_for(name: str) -> list[dict]:
    key = name.lower()
    if "github" in key:
        return [dict(item) for item in GITHUB_TOOLS]
    if "telegram" in key or "astrbot" in key:
        from app.adapters.astrbot.client import TELEGRAM_TOOLS

        return [dict(item) for item in TELEGRAM_TOOLS]
    return [{"name": "ping", "description": f"Health ping for {name}"}]


class McpRegistry:
    def __init__(self, audit_path: Path | None = None, mode: str = "mock") -> None:
        self.mode = mode
        self.audit_path = audit_path
        self._servers: dict[str, dict[str, Any]] = {
            "srv-github-mock": {
                "serverId": "srv-github-mock",
                "name": "github-mock",
                "connectionId": None,
                "tools": [dict(item) for item in GITHUB_TOOLS],
                "mode": mode,
            }
        }
        self._credentials: dict[str, dict[str, str]] = {}
        self._audit: list[dict[str, Any]] = []
        if audit_path:
            audit_path.parent.mkdir(parents=True, exist_ok=True)

    def list_servers(self) -> list[dict[str, Any]]:
        return [strip_secrets(dict(item)) for item in self._servers.values()]

    def register(
        self,
        *,
        connection_id: str,
        name: str,
        tools: list[dict] | None = None,
        credential_ref: str | None = None,
    ) -> dict[str, Any]:
        server_id = f"srv-{uuid4().hex[:8]}"
        cleaned_tools = strip_secrets(list(tools or default_tools_for(name)))
        ref = credential_ref or f"cred_{name}_{uuid4().hex[:10]}"
        self._credentials[connection_id] = {"credentialRef": ref}
        record = {
            "serverId": server_id,
            "name": name,
            "connectionId": connection_id,
            "tools": cleaned_tools,
            "mode": self.mode,
        }
        self._servers[server_id] = record
        return strip_secrets(dict(record))

    def list_tools(self, server_id: str) -> list[dict[str, Any]]:
        server = self._servers.get(server_id)
        if not server:
            return []
        return strip_secrets(list(server["tools"]))

    def _find_server(self, tool: str, server_id: str | None) -> dict[str, Any] | None:
        if server_id:
            return self._servers.get(server_id)
        for server in self._servers.values():
            names = {item.get("name") for item in server.get("tools") or []}
            if tool in names:
                return server
        return None

    def _tool_meta(self, server: dict[str, Any] | None, tool: str) -> dict[str, Any]:
        if not server:
            return {}
        for item in server.get("tools") or []:
            if item.get("name") == tool:
                return item
        return {}

    def invoke(self, tool: str, args: dict | None = None, server_id: str | None = None) -> dict[str, Any]:
        raw_args = dict(args or {})
        confirm = bool(raw_args.pop("confirm", False))
        safe_args = strip_secrets(raw_args)
        server = self._find_server(tool, server_id)
        meta = self._tool_meta(server, tool)
        if meta.get("confirmationRequired") and not confirm:
            event = {
                "id": f"aud-{uuid4().hex[:10]}",
                "ts": datetime.now(timezone.utc).isoformat(),
                "tool": tool,
                "serverId": (server or {}).get("serverId"),
                "connectionId": (server or {}).get("connectionId"),
                "ok": False,
                "args": safe_args,
                "error": "confirmation_required",
            }
            self._append_audit(event)
            return strip_secrets(
                {
                    "ok": False,
                    "tool": tool,
                    "args": safe_args,
                    "result": {},
                    "error": {
                        "code": "confirmation_required",
                        "message": "High-impact tool requires confirm=true",
                    },
                    "auditId": event["id"],
                    "mode": self.mode,
                }
            )
        credential = None
        if server and server.get("connectionId"):
            credential = self._credentials.get(server["connectionId"])
        # Inject credentials internally only — never copy into the result payload.
        _authorized = bool(credential and credential.get("credentialRef")) or server is not None
        result_body = dict(_STUB_RESULTS.get(tool, {"stub": True, "echo": safe_args}))
        event = {
            "id": f"aud-{uuid4().hex[:10]}",
            "ts": datetime.now(timezone.utc).isoformat(),
            "tool": tool,
            "serverId": (server or {}).get("serverId"),
            "connectionId": (server or {}).get("connectionId"),
            "ok": _authorized,
            "args": safe_args,
        }
        self._append_audit(event)
        payload = {
            "ok": _authorized,
            "tool": tool,
            "args": safe_args,
            "result": result_body,
            "auditId": event["id"],
            "mode": self.mode,
        }
        return strip_secrets(payload)

    def list_audit(self) -> list[dict[str, Any]]:
        return [strip_secrets(dict(item)) for item in self._audit]

    def _append_audit(self, event: dict[str, Any]) -> None:
        self._audit.append(event)
        if not self.audit_path:
            return
        with self.audit_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(strip_secrets(event)) + "\n")
