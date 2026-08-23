"""Pure safety / allowlist helpers — no WeChat dependency (unit-testable)."""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Any, Iterable


def normalize_id(value: str | None) -> str:
    return re.sub(r"\s+", "", (value or "").strip().lower())


def contact_matches_allowlist(
    allowlist: Iterable[str],
    *,
    wxid: str | None = None,
    alias: str | None = None,
    remark: str | None = None,
    name: str | None = None,
) -> bool:
    """Match Weixin ID / alias / remark / display name (case-insensitive)."""
    needles = {normalize_id(x) for x in allowlist if normalize_id(x)}
    if not needles:
        return False
    haystacks = {
        normalize_id(wxid),
        normalize_id(alias),
        normalize_id(remark),
        normalize_id(name),
    }
    haystacks.discard("")
    return bool(needles & haystacks)


@dataclass
class SafetyState:
    cooldown_seconds: int = 45
    max_replies_per_hour: int = 12
    max_reply_chars: int = 180
    _last_reply_at: dict[str, float] = field(default_factory=dict)
    _hour_bucket: int = 0
    _hour_count: int = 0

    def _rotate_hour(self, now: float) -> None:
        bucket = int(now // 3600)
        if bucket != self._hour_bucket:
            self._hour_bucket = bucket
            self._hour_count = 0

    def truncate(self, text: str) -> str:
        text = (text or "").strip()
        if len(text) <= self.max_reply_chars:
            return text
        return text[: max(0, self.max_reply_chars - 1)].rstrip() + "…"

    def allow_send(self, peer_key: str, *, now: float | None = None) -> tuple[bool, str]:
        now = time.time() if now is None else now
        self._rotate_hour(now)
        if self._hour_count >= self.max_replies_per_hour:
            return False, "hourly_limit"
        last = self._last_reply_at.get(peer_key, 0.0)
        if now - last < self.cooldown_seconds:
            return False, "cooldown"
        return True, "ok"

    def record_send(self, peer_key: str, *, now: float | None = None) -> None:
        now = time.time() if now is None else now
        self._rotate_hour(now)
        self._last_reply_at[peer_key] = now
        self._hour_count += 1


def should_handle_message(
    msg: dict[str, Any],
    *,
    enabled: bool,
    allow_groups: bool,
    ignore_self: bool,
    text_only: bool,
    allowlist: Iterable[str],
    contact_lookup: dict[str, dict[str, str]] | None = None,
) -> tuple[bool, str]:
    """
    msg keys (wcferry-like):
      sender, roomid, content, type, from_self (bool), is_group (bool optional)
    contact_lookup: wxid -> {alias, remark, name}
    """
    if not enabled:
        return False, "disabled"
    if ignore_self and bool(msg.get("from_self")):
        return False, "self"
    roomid = str(msg.get("roomid") or "").strip()
    is_group = bool(msg.get("is_group")) or bool(roomid)
    if is_group and not allow_groups:
        return False, "group"
    if text_only and int(msg.get("type") or 0) not in {0, 1}:
        # wcferry text is usually type 1; accept 0/1 for stubs
        return False, "non_text"
    content = str(msg.get("content") or "").strip()
    if not content:
        return False, "empty"
    sender = str(msg.get("sender") or "").strip()
    if not sender:
        return False, "no_sender"

    meta = (contact_lookup or {}).get(sender, {})
    if not contact_matches_allowlist(
        allowlist,
        wxid=sender,
        alias=meta.get("alias"),
        remark=meta.get("remark"),
        name=meta.get("name"),
    ):
        # Also allow direct Weixin-ID match if sender somehow is the alias
        if not contact_matches_allowlist(allowlist, wxid=sender, alias=sender):
            return False, "not_allowlisted"
    return True, "ok"
