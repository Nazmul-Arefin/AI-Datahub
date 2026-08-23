"""
Personal WeChat auto-reply bridge (WeChatFerry).

Safety defaults: dry_run=true, enabled=false, allowlist-only.
Never injects until you start with --live AND set enabled=true in config
or POST /control/enable.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import yaml

from replies import llm_reply, template_reply
from safety import SafetyState, should_handle_message

ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG = ROOT / "config.yaml"


def load_config(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as fh:
        data = yaml.safe_load(fh) or {}
    if not isinstance(data, dict):
        raise ValueError("config must be a mapping")
    return data


def setup_logging(cfg: dict[str, Any]) -> None:
    log_cfg = cfg.get("logging") or {}
    level = getattr(logging, str(log_cfg.get("level") or "INFO").upper(), logging.INFO)
    log_file = ROOT / str(log_cfg.get("file") or "logs/wechat-bridge.log")
    log_file.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8"),
        ],
    )


class BridgeRuntime:
    def __init__(self, cfg: dict[str, Any], *, force_live: bool = False) -> None:
        self.cfg = cfg
        self.lock = threading.RLock()
        self.force_live = force_live
        self.safety = SafetyState(
            cooldown_seconds=int(cfg.get("cooldown_seconds") or 45),
            max_replies_per_hour=int(cfg.get("max_replies_per_hour") or 12),
            max_reply_chars=int(cfg.get("max_reply_chars") or 180),
        )
        self.wcf = None
        self.contact_lookup: dict[str, dict[str, str]] = {}
        self.stats = {
            "seen": 0,
            "skipped": 0,
            "replied": 0,
            "dry_run": 0,
            "errors": 0,
        }

    @property
    def enabled(self) -> bool:
        return bool(self.cfg.get("enabled"))

    @enabled.setter
    def enabled(self, value: bool) -> None:
        self.cfg["enabled"] = bool(value)

    @property
    def dry_run(self) -> bool:
        # Live only when config says so AND process started with --live
        if not self.force_live:
            return True
        return bool(self.cfg.get("dry_run", True))

    def status(self) -> dict[str, Any]:
        with self.lock:
            return {
                "enabled": self.enabled,
                "dry_run": self.dry_run,
                "force_live": self.force_live,
                "allowlist": list(self.cfg.get("allowlist") or []),
                "reply_mode": self.cfg.get("reply_mode") or "template",
                "stats": dict(self.stats),
                "contacts_indexed": len(self.contact_lookup),
            }

    def refresh_contacts(self) -> int:
        if self.wcf is None:
            return 0
        contacts = self.wcf.get_contacts() or []
        lookup: dict[str, dict[str, str]] = {}
        for row in contacts:
            # wcferry Contact may be object or dict-like
            wxid = str(getattr(row, "wxid", None) or (row.get("wxid") if isinstance(row, dict) else "") or "")
            if not wxid:
                continue
            lookup[wxid] = {
                "alias": str(getattr(row, "code", None) or getattr(row, "alias", None) or (row.get("code") if isinstance(row, dict) else "") or ""),
                "remark": str(getattr(row, "remark", None) or (row.get("remark") if isinstance(row, dict) else "") or ""),
                "name": str(getattr(row, "name", None) or (row.get("name") if isinstance(row, dict) else "") or ""),
            }
        self.contact_lookup = lookup
        logging.info("Indexed %s contacts for allowlist matching", len(lookup))
        # Help operator verify whitelist target exists
        target = "nazmularefin"
        hits = [
            (wxid, meta)
            for wxid, meta in lookup.items()
            if target in {
                (meta.get("alias") or "").lower(),
                (meta.get("remark") or "").lower(),
                (meta.get("name") or "").lower(),
                wxid.lower(),
            }
        ]
        if hits:
            logging.info("Allowlist target %r matched: %s", target, hits[:3])
        else:
            logging.warning(
                "Allowlist target %r not found in contacts yet — "
                "open that chat once, or confirm Weixin ID spelling.",
                target,
            )
        return len(lookup)

    def build_reply(self, content: str) -> str:
        mode = str(self.cfg.get("reply_mode") or "template").lower()
        if mode == "llm":
            llm_cfg = self.cfg.get("llm") or {}
            text = llm_reply(
                content,
                system_prompt=str(llm_cfg.get("system_prompt") or ""),
                base_url=str(llm_cfg.get("base_url") or "https://api.deepseek.com"),
                model=str(llm_cfg.get("model") or "deepseek-chat"),
            )
        else:
            text = template_reply(str(self.cfg.get("template_reply") or ""))
        return self.safety.truncate(text)

    def handle_raw_message(self, msg: Any) -> None:
        with self.lock:
            self.stats["seen"] += 1
            payload = {
                "sender": str(getattr(msg, "sender", "") or ""),
                "roomid": str(getattr(msg, "roomid", "") or ""),
                "content": str(getattr(msg, "content", "") or ""),
                "type": int(getattr(msg, "type", 0) or 0),
                "from_self": bool(getattr(msg, "from_self", False)),
                "is_group": bool(getattr(msg, "roomid", "")),
            }
            ok, reason = should_handle_message(
                payload,
                enabled=self.enabled,
                allow_groups=bool(self.cfg.get("allow_groups")),
                ignore_self=bool(self.cfg.get("ignore_self", True)),
                text_only=bool(self.cfg.get("text_only", True)),
                allowlist=list(self.cfg.get("allowlist") or []),
                contact_lookup=self.contact_lookup,
            )
            if not ok:
                self.stats["skipped"] += 1
                logging.debug("skip sender=%s reason=%s", payload["sender"], reason)
                return

            peer = payload["sender"]
            allowed, limit_reason = self.safety.allow_send(peer)
            if not allowed:
                self.stats["skipped"] += 1
                logging.info("rate-limit sender=%s reason=%s", peer, limit_reason)
                return

            try:
                reply = self.build_reply(payload["content"])
            except Exception:
                self.stats["errors"] += 1
                logging.exception("Failed to build reply")
                return

            if not reply:
                self.stats["skipped"] += 1
                return

            if self.dry_run or self.wcf is None:
                self.stats["dry_run"] += 1
                logging.info(
                    "DRY-RUN would reply to %s (%s): %r",
                    peer,
                    self.contact_lookup.get(peer, {}),
                    reply,
                )
                self.safety.record_send(peer)
                return

            try:
                self.wcf.send_text(reply, peer)
                self.safety.record_send(peer)
                self.stats["replied"] += 1
                logging.info("Replied to %s: %r", peer, reply)
            except Exception:
                self.stats["errors"] += 1
                logging.exception("send_text failed for %s", peer)


def start_control_server(runtime: BridgeRuntime, host: str, port: int) -> ThreadingHTTPServer:
    bridge = runtime

    class Handler(BaseHTTPRequestHandler):
        def _json(self, code: int, payload: dict[str, Any]) -> None:
            raw = json.dumps(payload).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self) -> None:  # noqa: N802
            if self.path.rstrip("/") == "/health":
                self._json(200, {"ok": True, **bridge.status()})
                return
            if self.path.rstrip("/") == "/status":
                self._json(200, bridge.status())
                return
            self._json(404, {"ok": False, "error": "not_found"})

        def do_POST(self) -> None:  # noqa: N802
            path = self.path.rstrip("/")
            if path == "/enable":
                bridge.enabled = True
                logging.warning("Auto-reply ENABLED via control API")
                self._json(200, bridge.status())
                return
            if path == "/disable":
                bridge.enabled = False
                logging.warning("Auto-reply DISABLED via control API")
                self._json(200, bridge.status())
                return
            if path == "/refresh-contacts":
                count = bridge.refresh_contacts()
                self._json(200, {"ok": True, "contacts": count, **bridge.status()})
                return
            self._json(404, {"ok": False, "error": "not_found"})

        def log_message(self, fmt: str, *args: Any) -> None:
            logging.debug("control: " + fmt, *args)

    server = ThreadingHTTPServer((host, port), Handler)
    thread = threading.Thread(target=server.serve_forever, name="wechat-bridge-control", daemon=True)
    thread.start()
    logging.info("Control API on http://%s:%s  (GET /status, POST /enable|/disable)", host, port)
    return server


def attach_wcf(runtime: BridgeRuntime) -> None:
    try:
        from wcferry import Wcf
    except ImportError as exc:
        raise SystemExit(
            "wcferry is not installed. Use Python 3.11/3.12 and: "
            "pip install -r requirements.txt"
        ) from exc

    logging.info("Attaching WeChatFerry to WeChat PC (must be 3.9.12.x logged in)…")
    wcf = Wcf(debug=False)
    if not wcf.is_login():
        wcf.cleanup()
        raise SystemExit("WeChat is not logged in. Open WeChat 3.9.12.51, scan QR, then retry.")
    runtime.wcf = wcf
    runtime.refresh_contacts()
    wcf.enable_receiving_msg()
    logging.info("Receiving messages. dry_run=%s enabled=%s", runtime.dry_run, runtime.enabled)


def message_loop(runtime: BridgeRuntime) -> None:
    assert runtime.wcf is not None
    while runtime.wcf.is_receiving_msg():
        try:
            msg = runtime.wcf.get_msg()
        except Exception:
            time.sleep(0.2)
            continue
        if msg is None:
            continue
        try:
            runtime.handle_raw_message(msg)
        except Exception:
            logging.exception("Unhandled message error")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Safe WeChat personal auto-reply bridge")
    p.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    p.add_argument(
        "--live",
        action="store_true",
        help="Allow real send_text when config dry_run=false. Without this, always dry-run.",
    )
    p.add_argument(
        "--self-test",
        action="store_true",
        help="Run allowlist safety simulation and exit (no WeChat attach).",
    )
    return p.parse_args()


def run_self_test(cfg: dict[str, Any]) -> int:
    runtime = BridgeRuntime(cfg, force_live=False)
    runtime.enabled = True
    runtime.contact_lookup = {
        "wxid_demo_boss": {
            "alias": "nazmularefin",
            "remark": "Nazmul Arefin",
            "name": "Nazmul Arefin",
        },
        "wxid_stranger": {"alias": "someoneelse", "remark": "", "name": "Stranger"},
    }

    cases = [
        ({"sender": "wxid_demo_boss", "content": "Are you in the office?", "type": 1, "from_self": False, "roomid": ""}, True),
        ({"sender": "wxid_stranger", "content": "Hi", "type": 1, "from_self": False, "roomid": ""}, False),
        ({"sender": "wxid_demo_boss", "content": "Hi", "type": 1, "from_self": True, "roomid": ""}, False),
        ({"sender": "wxid_demo_boss", "content": "Hi", "type": 1, "from_self": False, "roomid": "room123"}, False),
    ]
    failed = 0
    for payload, expect in cases:
        class M:
            pass
        m = M()
        for k, v in payload.items():
            setattr(m, k, v)
        before = runtime.stats["dry_run"]
        runtime.handle_raw_message(m)
        got = runtime.stats["dry_run"] > before
        ok = got == expect
        print(f"case sender={payload['sender']} expect_reply={expect} got={got} {'OK' if ok else 'FAIL'}")
        if not ok:
            failed += 1
    print("status", runtime.status())
    return 1 if failed else 0


def main() -> int:
    args = parse_args()
    cfg = load_config(args.config)
    setup_logging(cfg)

    if args.self_test:
        return run_self_test(cfg)

    if args.live and bool(cfg.get("dry_run", True)):
        logging.error(
            "Refusing --live while config dry_run=true. "
            "Edit config.yaml: set dry_run: false only when ready."
        )
        return 2

    runtime = BridgeRuntime(cfg, force_live=bool(args.live))
    control = cfg.get("control") or {}
    start_control_server(
        runtime,
        str(control.get("host") or "127.0.0.1"),
        int(control.get("port") or 8765),
    )

    if not args.live:
        logging.warning(
            "Started in SAFE mode (no WeChat attach). "
            "Use: python bridge.py --self-test   OR   python bridge.py --live "
            "after installing WeChat 3.9.12.51 and setting dry_run/enabled carefully."
        )
        logging.info("Control API is up. Press Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            return 0

    attach_wcf(runtime)
    try:
        message_loop(runtime)
    except KeyboardInterrupt:
        logging.info("Stopping…")
    finally:
        if runtime.wcf is not None:
            try:
                runtime.wcf.cleanup()
            except Exception:
                pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
