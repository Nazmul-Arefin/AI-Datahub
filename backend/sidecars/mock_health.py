"""Minimal JSON health server for Compose mock sidecars (stdlib only)."""

from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


NAME = os.environ.get("SIDECAR_NAME", "sidecar")
PORT = int(os.environ.get("PORT", "8080"))


class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        payload = {"status": "ok", "service": NAME, "mode": "mock"}
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:  # noqa: A002
        return


def main() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), HealthHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
