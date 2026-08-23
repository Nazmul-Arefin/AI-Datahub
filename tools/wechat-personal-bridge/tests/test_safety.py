"""Unit tests for allowlist + safety (no WeChat / wcferry required)."""

from __future__ import annotations

import unittest

from safety import SafetyState, contact_matches_allowlist, should_handle_message


class AllowlistTests(unittest.TestCase):
    def test_match_weixin_id(self) -> None:
        self.assertTrue(
            contact_matches_allowlist(
                ["nazmularefin"],
                wxid="wxid_abc",
                alias="nazmularefin",
            )
        )

    def test_reject_other(self) -> None:
        self.assertFalse(
            contact_matches_allowlist(
                ["nazmularefin"],
                wxid="wxid_abc",
                alias="otherperson",
                name="Someone",
            )
        )


class MessageGateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.lookup = {
            "wxid_boss": {
                "alias": "nazmularefin",
                "remark": "Nazmul Arefin",
                "name": "Nazmul Arefin",
            }
        }
        self.base = dict(
            enabled=True,
            allow_groups=False,
            ignore_self=True,
            text_only=True,
            allowlist=["nazmularefin"],
            contact_lookup=self.lookup,
        )

    def test_allow_boss_text(self) -> None:
        ok, reason = should_handle_message(
            {"sender": "wxid_boss", "content": "Are you in?", "type": 1, "from_self": False, "roomid": ""},
            **self.base,
        )
        self.assertTrue(ok, reason)

    def test_block_stranger(self) -> None:
        ok, reason = should_handle_message(
            {"sender": "wxid_x", "content": "Hi", "type": 1, "from_self": False, "roomid": ""},
            **self.base,
        )
        self.assertFalse(ok)
        self.assertEqual(reason, "not_allowlisted")

    def test_block_when_disabled(self) -> None:
        cfg = {**self.base, "enabled": False}
        ok, reason = should_handle_message(
            {"sender": "wxid_boss", "content": "Hi", "type": 1, "from_self": False, "roomid": ""},
            **cfg,
        )
        self.assertFalse(ok)
        self.assertEqual(reason, "disabled")

    def test_block_group(self) -> None:
        ok, reason = should_handle_message(
            {"sender": "wxid_boss", "content": "Hi", "type": 1, "from_self": False, "roomid": "xxx@chatroom"},
            **self.base,
        )
        self.assertFalse(ok)
        self.assertEqual(reason, "group")


class RateLimitTests(unittest.TestCase):
    def test_cooldown(self) -> None:
        s = SafetyState(cooldown_seconds=30, max_replies_per_hour=10)
        ok, _ = s.allow_send("a", now=1000)
        self.assertTrue(ok)
        s.record_send("a", now=1000)
        ok, reason = s.allow_send("a", now=1010)
        self.assertFalse(ok)
        self.assertEqual(reason, "cooldown")


if __name__ == "__main__":
    unittest.main()
