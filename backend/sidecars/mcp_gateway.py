"""MCP gateway sidecar — registry + invoke stub. Stdlib only.

Credentials are held in-process and never written into invoke JSON.
Audit events go to DATA_DIR/mcp_audit.jsonl (Dev1 mcp_audit_events table is not present).
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from uuid import uuid4
from urllib.parse import urlparse

NAME = os.environ.get("SIDECAR_NAME", "mcp_gateway")
PORT = int(os.environ.get("PORT", "8080"))
DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
AUDIT_PATH = DATA_DIR / "mcp_audit.jsonl"
REGISTRY_PATH = DATA_DIR / "registry.json"

SECRET_KEYS = {
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
}

GITHUB_TOOLS = [
    {"name": "list_repos", "description": "List repositories for the connected GitHub account"},
    {"name": "get_user", "description": "Get the authenticated GitHub user profile"},
]

STUB_RESULTS = {
    "list_repos": {"repos": [{"fullName": "acme/demo", "private": False}]},
    "get_user": {"login": "acme", "type": "User"},
    "list_chats": {"chats": [{"id": "chat-1", "title": "Demo"}]},
    "send_message": {"delivered": True},
}

SERVERS: dict[str, dict[str, Any]] = {}
CREDENTIALS: dict[str, dict[str, str]] = {}
AUDIT: list[dict[str, Any]] = []


def strip_secrets(payload: Any) -> Any:
    if isinstance(payload, dict):
        return {key: strip_secrets(value) for key, value in payload.items() if key not in SECRET_KEYS}
    if isinstance(payload, list):
        return [strip_secrets(item) for item in payload]
    return payload


def default_tools_for(name: str) -> list[dict[str, str]]:
    if "github" in name.lower():
        return [dict(item) for item in GITHUB_TOOLS]
    return [{"name": "ping", "description": f"Health ping for {name}"}]


def persist_registry() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REGISTRY_PATH.write_text(
        json.dumps({"servers": SERVERS, "credentials": CREDENTIALS}, indent=2),
        encoding="utf-8",
    )


def load_registry() -> None:
    if not REGISTRY_PATH.exists():
        SERVERS["srv-github-mock"] = {
            "serverId": "srv-github-mock",
            "name": "github-mock",
            "connectionId": None,
            "tools": [dict(item) for item in GITHUB_TOOLS],
            "mode": "live",
        }
        persist_registry()
        return
    data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    SERVERS.update(data.get("servers") or {})
    CREDENTIALS.update(data.get("credentials") or {})


def append_audit(event: dict[str, Any]) -> None:
    AUDIT.append(event)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with AUDIT_PATH.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(strip_secrets(event)) + "\n")


def register(body: dict[str, Any]) -> dict[str, Any]:
    connection_id = body.get("connectionId") or body.get("connection_id") or f"conn-{uuid4().hex[:8]}"
    name = body.get("name") or "github"
    tools = body.get("tools") or default_tools_for(name)
    ref = body.get("credentialRef") or body.get("credential_ref") or f"cred_{name}_{uuid4().hex[:10]}"
    server_id = f"srv-{uuid4().hex[:8]}"
    CREDENTIALS[connection_id] = {"credentialRef": ref}
    record = {
        "serverId": server_id,
        "name": name,
        "connectionId": connection_id,
        "tools": strip_secrets(list(tools)),
        "mode": "live",
    }
    SERVERS[server_id] = record
    persist_registry()
    return strip_secrets(dict(record))


def find_server(tool: str, server_id: str | None) -> dict[str, Any] | None:
    if server_id:
        return SERVERS.get(server_id)
    for server in SERVERS.values():
        names = {item.get("name") for item in server.get("tools") or []}
        if tool in names:
            return server
    return None


def invoke(body: dict[str, Any]) -> dict[str, Any]:
    tool = body.get("tool") or ""
    raw_args = dict(body.get("args") or {})
    confirm = bool(raw_args.pop("confirm", False))
    args = strip_secrets(raw_args)
    server = find_server(tool, body.get("serverId") or body.get("server_id"))
    meta = {}
    for item in (server or {}).get("tools") or []:
        if item.get("name") == tool:
            meta = item
            break
    if meta.get("confirmationRequired") and not confirm:
        event = {
            "id": f"aud-{uuid4().hex[:10]}",
            "ts": datetime.now(timezone.utc).isoformat(),
            "tool": tool,
            "serverId": (server or {}).get("serverId"),
            "connectionId": (server or {}).get("connectionId"),
            "ok": False,
            "args": args,
            "error": "confirmation_required",
        }
        append_audit(event)
        return strip_secrets(
            {
                "ok": False,
                "tool": tool,
                "args": args,
                "result": {},
                "error": {
                    "code": "confirmation_required",
                    "message": "High-impact tool requires confirm=true",
                },
                "auditId": event["id"],
                "mode": "live",
            }
        )
    credential = None
    if server and server.get("connectionId"):
        credential = CREDENTIALS.get(server["connectionId"])
    _authorized = bool(credential and credential.get("credentialRef")) or server is not None
    result_body = dict(STUB_RESULTS.get(tool, {"stub": True, "echo": args}))
    event = {
        "id": f"aud-{uuid4().hex[:10]}",
        "ts": datetime.now(timezone.utc).isoformat(),
        "tool": tool,
        "serverId": (server or {}).get("serverId"),
        "connectionId": (server or {}).get("connectionId"),
        "ok": _authorized,
        "args": args,
    }
    append_audit(event)
    return strip_secrets(
        {
            "ok": _authorized,
            "tool": tool,
            "args": args,
            "result": result_body,
            "auditId": event["id"],
            "mode": "live",
        }
    )


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, payload: dict | list) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length") or "0")
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        data = json.loads(raw.decode("utf-8") or "{}")
        return data if isinstance(data, dict) else {}

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path.rstrip("/") or "/"
        if path in {"/", "/health"}:
            self._send(200, {"status": "ok", "service": NAME, "mode": "live"})
            return
        if path == "/servers":
            self._send(200, {"servers": [strip_secrets(dict(item)) for item in SERVERS.values()]})
            return
        if path == "/audit":
            self._send(200, {"events": [strip_secrets(dict(item)) for item in AUDIT], "total": len(AUDIT)})
            return
        parts = path.strip("/").split("/")
        if len(parts) == 3 and parts[0] == "servers" and parts[2] == "tools":
            server = SERVERS.get(parts[1])
            if not server:
                self._send(404, {"error": {"code": "not_found", "message": "MCP server not found"}})
                return
            self._send(200, {"serverId": parts[1], "tools": strip_secrets(list(server["tools"]))})
            return
        self._send(404, {"error": {"code": "not_found", "message": "unknown path"}})

    def do_POST(self) -> None:  # noqa: N802
        path = urlparse(self.path).path.rstrip("/") or "/"
        body = self._read_json()
        if path == "/register":
            self._send(200, register(body))
            return
        if path == "/invoke":
            self._send(200, invoke(body))
            return
        self._send(404, {"error": {"code": "not_found", "message": "unknown path"}})

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    load_registry()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    server.serve_forever()


if __name__ == "__main__":
    main()
