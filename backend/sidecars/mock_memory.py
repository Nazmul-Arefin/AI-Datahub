"""Mock TencentDB-shaped memory sidecar (stdlib only)."""

from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

PORT = int(os.environ.get("PORT", "8080"))
STORE: dict[str, dict] = {}


def _send(handler: BaseHTTPRequestHandler, code: int, payload: dict | list) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


class MemoryHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path in {"/health", "/"}:
            _send(self, 200, {"status": "ok", "service": "memory", "mode": "mock"})
            return
        if parsed.path == "/memories":
            query = parse_qs(parsed.query).get("q", [""])[0].lower()
            items = [
                item
                for item in STORE.values()
                if query in item["title"].lower() or query in item["content"].lower()
            ]
            _send(self, 200, {"items": items, "total": len(items), "mode": "mock"})
            return
        if parsed.path.startswith("/memories/"):
            memory_id = parsed.path.rsplit("/", 1)[-1]
            item = STORE.get(memory_id)
            if not item:
                _send(self, 404, {"error": {"code": "not_found", "message": "Memory not found"}})
                return
            _send(self, 200, item)
            return
        _send(self, 404, {"error": {"code": "not_found", "message": "Unknown path"}})

    def do_POST(self) -> None:  # noqa: N802
        if self.path.rstrip("/") != "/memories":
            _send(self, 404, {"error": {"code": "not_found", "message": "Unknown path"}})
            return
        length = int(self.headers.get("Content-Length", "0"))
        data = json.loads(self.rfile.read(length) or b"{}")
        item = {
            "id": f"mem-{uuid4().hex[:10]}",
            "title": data.get("title", ""),
            "content": data.get("content", ""),
            "source": data.get("source"),
            "mode": "mock",
        }
        STORE[item["id"]] = item
        _send(self, 200, item)

    def do_PATCH(self) -> None:  # noqa: N802
        if not self.path.startswith("/memories/"):
            _send(self, 404, {"error": {"code": "not_found", "message": "Unknown path"}})
            return
        memory_id = self.path.rsplit("/", 1)[-1]
        item = STORE.get(memory_id)
        if not item:
            _send(self, 404, {"error": {"code": "not_found", "message": "Memory not found"}})
            return
        length = int(self.headers.get("Content-Length", "0"))
        data = json.loads(self.rfile.read(length) or b"{}")
        for key in ("title", "content", "source"):
            if key in data and data[key] is not None:
                item[key] = data[key]
        _send(self, 200, item)

    def do_DELETE(self) -> None:  # noqa: N802
        if not self.path.startswith("/memories/"):
            _send(self, 404, {"error": {"code": "not_found", "message": "Unknown path"}})
            return
        memory_id = self.path.rsplit("/", 1)[-1]
        existed = STORE.pop(memory_id, None) is not None
        _send(self, 200, {"deleted": existed, "id": memory_id})

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return


def main() -> None:
    ThreadingHTTPServer(("0.0.0.0", PORT), MemoryHandler).serve_forever()


if __name__ == "__main__":
    main()
