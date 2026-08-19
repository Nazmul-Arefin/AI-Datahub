import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from app.adapters.sidecar_health.client import SidecarHealthClient
from app.core.config import Settings
from app.services.sidecar_health_service import SidecarHealthService


class _OkHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        body = b'{"status":"ok"}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        return


class _HealthMissingRootOk(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0].rstrip("/") or "/"
        if path == "/health":
            self.send_response(404)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        body = b'{"status":"ok"}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        return


class _Always404(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802
        self.send_response(404)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        return


class _AlwaysOk:
    async def ping(self, url: str, timeout_seconds: float) -> tuple[bool, str]:
        return True, "ok"


def _start(handler: type[BaseHTTPRequestHandler]) -> tuple[ThreadingHTTPServer, threading.Thread]:
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def _stop(server: ThreadingHTTPServer, thread: threading.Thread) -> None:
    server.shutdown()
    server.server_close()
    thread.join(timeout=2)


@pytest.mark.asyncio
async def test_sidecar_health_client_ping_ok():
    server, thread = _start(_OkHandler)
    try:
        url = f"http://127.0.0.1:{server.server_address[1]}"
        ok, detail = await SidecarHealthClient().ping(url, timeout_seconds=1.0)
        assert ok is True
        assert "http 200" in detail or detail == "ok"
    finally:
        _stop(server, thread)


@pytest.mark.asyncio
async def test_sidecar_health_skips_404_health_and_accepts_root():
    server, thread = _start(_HealthMissingRootOk)
    try:
        url = f"http://127.0.0.1:{server.server_address[1]}"
        ok, detail = await SidecarHealthClient().ping(url, timeout_seconds=1.0)
        assert ok is True
        assert "http 200" in detail
    finally:
        _stop(server, thread)


@pytest.mark.asyncio
async def test_sidecar_health_404_on_all_paths_is_down():
    server, thread = _start(_Always404)
    try:
        url = f"http://127.0.0.1:{server.server_address[1]}"
        ok, detail = await SidecarHealthClient().ping(url, timeout_seconds=1.0)
        assert ok is False
        assert "404" in detail
    finally:
        _stop(server, thread)


@pytest.mark.asyncio
async def test_sidecar_health_service_reports_ok_when_all_up():
    settings = Settings(
        agent_harness_url="http://harness.test",
        astrbot_url="http://astrbot.test",
        nango_url="http://nango.test",
        memory_service_url="http://memory.test",
    )
    result = await SidecarHealthService(client=_AlwaysOk(), settings=settings).check_all()
    names = {item.name for item in result.sidecars}
    assert result.status == "ok"
    assert {"harness", "astrbot", "nango", "memory"} <= names
    assert all(item.status == "ok" for item in result.sidecars)
