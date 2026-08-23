"""AstrBot messaging adapter — live platform register/sync for China + Telegram."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

import httpx

from app.core.config import settings

# Catalog / messaging ids → AstrBot platform `type` values.
PLATFORM_SPECS: dict[str, dict[str, Any]] = {
    "telegram": {
        "id": "telegram",
        "name": "Telegram",
        "astrbot_type": "telegram",
        "region": "global",
        "setup_path": "/#/platforms",
    },
    "discord": {
        "id": "discord",
        "name": "Discord",
        "astrbot_type": "discord",
        "region": "global",
        "setup_path": "/#/platforms",
    },
    "feishu": {
        "id": "feishu",
        "name": "飞书 Feishu",
        "astrbot_type": "lark",
        "region": "cn",
        "setup_path": "/#/platforms",
        "hint": "Platforms → Add → lark / Feishu → One-click QR (recommended).",
    },
    "dingtalk": {
        "id": "dingtalk",
        "name": "钉钉 DingTalk",
        "astrbot_type": "dingtalk",
        "region": "cn",
        "setup_path": "/#/platforms",
        "hint": "Platforms → Add → DingTalk → One-click QR setup.",
    },
    "wecom": {
        "id": "wecom",
        "name": "企业微信 WeCom",
        "astrbot_type": "wecom",
        "region": "cn",
        "setup_path": "/#/platforms",
        "hint": "Platforms → Add → wecom (App or Customer Service).",
    },
    "wecom-ai": {
        "id": "wecom-ai",
        "name": "企微智能机器人",
        "astrbot_type": "wecom_ai_bot",
        "region": "cn",
        "setup_path": "/#/platforms",
        "hint": "Platforms → Add → wecom_ai_bot.",
    },
    "qq": {
        "id": "qq",
        "name": "QQ",
        "astrbot_type": "qq_official",
        "region": "cn",
        "setup_path": "/#/platforms",
        "hint": "Platforms → Add → qq_official (AppID + Secret).",
    },
    "wechat": {
        "id": "wechat",
        "name": "微信 WeChat",
        "astrbot_type": "weixin_oc",
        "region": "cn",
        "setup_path": "/#/platforms",
        "hint": (
            "Platforms → Add → 个人微信 (Personal WeChat) → scan the QR with your phone "
            "WeChat, then Save and Connect again."
        ),
    },
}

PLATFORMS = tuple(
    {
        "id": spec["id"],
        "name": spec["name"],
        "status": "available",
        "region": spec.get("region", "global"),
    }
    for spec in PLATFORM_SPECS.values()
)

MESSAGING_TOOLS = [
    {
        "name": "list_chats",
        "description": "List recent chats for the connected messaging bot",
        "confirmationRequired": False,
    },
    {
        "name": "send_message",
        "description": "Send a message (high-impact; requires confirm=true)",
        "confirmationRequired": True,
    },
]

# Back-compat alias used by older imports.
TELEGRAM_TOOLS = MESSAGING_TOOLS


class AstrBotClient:
    def __init__(
        self,
        base_url: str | None = None,
        mode: str | None = None,
        telegram_bot_token: str | None = None,
        dashboard_token: str | None = None,
    ) -> None:
        self.base_url = (base_url or settings.astrbot_url).rstrip("/")
        self.public_url = settings.astrbot_public_url.rstrip("/")
        self.mode = mode or settings.astrbot_mode
        self.telegram_bot_token = (
            settings.telegram_bot_token if telegram_bot_token is None else telegram_bot_token
        )
        self.dashboard_token = (
            settings.astrbot_dashboard_token if dashboard_token is None else dashboard_token
        )

    def _auth_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.dashboard_token:
            headers["Authorization"] = f"Bearer {self.dashboard_token}"
        return headers

    async def ping(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
                response = await client.get(self.base_url)
            return response.status_code < 500
        except httpx.HTTPError:
            return False

    async def list_platforms(self) -> list[dict[str, str]]:
        return [dict(item) for item in PLATFORMS]

    def _mock_connect(self, platform: str, *, reason: str = "mock") -> dict[str, str]:
        return {
            "platform": platform,
            "status": "connected",
            "credentialRef": f"cred_{platform}_{uuid4().hex[:8]}",
            "mode": "mock",
            "webUi": self.public_url,
            "reason": reason,
        }

    def _setup_required(self, platform: str, spec: dict[str, Any]) -> dict[str, str]:
        setup = f"{self.public_url}{spec.get('setup_path') or '/#/platforms'}"
        return {
            "platform": platform,
            "status": "setup_required",
            "credentialRef": f"cred_{platform}_pending",
            "mode": self.mode,
            "webUi": self.public_url,
            "setupUrl": setup,
            "hint": str(spec.get("hint") or "Open AstrBot Bots and create this platform, then Connect again."),
            "astrbotType": str(spec.get("astrbot_type") or platform),
        }

    async def verify_bot(self) -> dict | None:
        """Confirm TELEGRAM_BOT_TOKEN with Telegram getMe. Never returns the token."""
        if not self.telegram_bot_token:
            return None
        url = f"https://api.telegram.org/bot{self.telegram_bot_token}/getMe"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
        except httpx.HTTPError:
            return None
        if response.status_code >= 400:
            return None
        data = response.json() if response.content else {}
        if not isinstance(data, dict) or not data.get("ok"):
            return None
        result = data.get("result") if isinstance(data.get("result"), dict) else {}
        return {"username": result.get("username"), "id": result.get("id")}

    async def list_remote_bots(self) -> list[dict[str, Any]]:
        """List bots configured in AstrBot (secrets stripped)."""
        if self.mode != "live":
            return []
        urls = [
            f"{self.base_url}/api/v1/bots",
            f"{self.base_url}/api/config/platform/list",
        ]
        async with httpx.AsyncClient(timeout=12.0) as client:
            for url in urls:
                try:
                    response = await client.get(url, headers=self._auth_headers())
                except httpx.HTTPError:
                    continue
                if response.status_code >= 400:
                    continue
                body = response.json() if response.content else {}
                data = body.get("data", body) if isinstance(body, dict) else {}
                bots = data.get("bots") or data.get("platforms") or []
                if isinstance(bots, list):
                    cleaned: list[dict[str, Any]] = []
                    for bot in bots:
                        if not isinstance(bot, dict):
                            continue
                        cleaned.append(
                            {
                                "id": bot.get("id"),
                                "type": bot.get("type"),
                                "enable": bool(bot.get("enable", False)),
                            }
                        )
                    return cleaned
        return []

    async def get_lark_credentials(self) -> dict[str, str] | None:
        """Return app_id/secret for the first enabled lark adapter. Server-only — never expose via HTTP."""
        if self.mode != "live" or not self.dashboard_token:
            # Env fallback is handled by FeishuClient.resolve_credentials
            return None
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(
                    f"{self.base_url}/api/config/platform/list",
                    headers=self._auth_headers(),
                )
        except httpx.HTTPError:
            return None
        if response.status_code >= 400:
            return None
        body = response.json() if response.content else {}
        data = body.get("data", body) if isinstance(body, dict) else {}
        platforms = data.get("platforms") or data.get("bots") or []
        for bot in platforms:
            if not isinstance(bot, dict):
                continue
            if str(bot.get("type") or "") != "lark" or not bot.get("enable"):
                continue
            app_id = str(bot.get("app_id") or "").strip()
            app_secret = str(bot.get("app_secret") or "").strip()
            if not app_id or not app_secret:
                continue
            return {
                "app_id": app_id,
                "app_secret": app_secret,
                "domain": str(bot.get("domain") or "https://open.feishu.cn").rstrip("/"),
                "adapter_id": str(bot.get("id") or "lark"),
            }
        return None

    async def list_remote_bot_types(self) -> list[str]:
        if self.mode != "live":
            return []
        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/bot-types",
                    headers=self._auth_headers(),
                )
        except httpx.HTTPError:
            return []
        if response.status_code >= 400:
            return []
        body = response.json() if response.content else {}
        data = body.get("data", body) if isinstance(body, dict) else {}
        rows = data.get("bot_types") or []
        return [str(row.get("type") or row.get("id") or "") for row in rows if isinstance(row, dict)]

    def _env_payload_for(self, platform: str) -> dict[str, Any] | None:
        """Build AstrBot platform/new payload from env credentials when present."""
        key = platform.lower()
        if key == "telegram" and self.telegram_bot_token:
            return {
                "id": "telegram-weeple",
                "type": "telegram",
                "enable": True,
                "telegram_token": self.telegram_bot_token,
            }
        if key == "feishu":
            app_id = getattr(settings, "feishu_app_id", "") or ""
            app_secret = getattr(settings, "feishu_app_secret", "") or ""
            if app_id and app_secret:
                return {
                    "id": "feishu-weeple",
                    "type": "lark",
                    "enable": True,
                    "app_id": app_id,
                    "app_secret": app_secret,
                    "domain": getattr(settings, "feishu_domain", None) or "https://open.feishu.cn",
                    "lark_connection_mode": "socket",
                }
        if key == "dingtalk":
            client_id = getattr(settings, "dingtalk_client_id", "") or ""
            client_secret = getattr(settings, "dingtalk_client_secret", "") or ""
            if client_id and client_secret:
                return {
                    "id": "dingtalk-weeple",
                    "type": "dingtalk",
                    "enable": True,
                    "client_id": client_id,
                    "client_secret": client_secret,
                }
        if key == "wecom":
            corpid = getattr(settings, "wecom_corpid", "") or ""
            secret = getattr(settings, "wecom_secret", "") or ""
            token = getattr(settings, "wecom_token", "") or ""
            aes = getattr(settings, "wecom_encoding_aes_key", "") or ""
            if corpid and secret and token and aes:
                return {
                    "id": "wecom-weeple",
                    "type": "wecom",
                    "enable": True,
                    "corpid": corpid,
                    "secret": secret,
                    "token": token,
                    "encoding_aes_key": aes,
                    "unified_webhook_mode": True,
                }
        if key in {"wecom-ai", "wecom_ai", "wecom_ai_bot"}:
            # Prefer dedicated AI-bot fields; fall back to WeCom corp credentials.
            token = getattr(settings, "wecom_ai_token", "") or getattr(settings, "wecom_token", "") or ""
            aes = (
                getattr(settings, "wecom_ai_encoding_aes_key", "")
                or getattr(settings, "wecom_encoding_aes_key", "")
                or ""
            )
            if token and aes:
                return {
                    "id": "wecom-ai-weeple",
                    "type": "wecom_ai_bot",
                    "enable": True,
                    "token": token,
                    "encoding_aes_key": aes,
                }
        if key == "qq":
            appid = getattr(settings, "qq_appid", "") or ""
            secret = getattr(settings, "qq_secret", "") or ""
            if appid and secret:
                return {
                    "id": "qq-weeple",
                    "type": "qq_official",
                    "enable": True,
                    "appid": appid,
                    "secret": secret,
                    "enable_group_c2c": True,
                    "enable_guild_direct_message": True,
                }
        return None

    async def _create_platform(self, payload: dict[str, Any]) -> bool:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/config/platform/new",
                    headers=self._auth_headers(),
                    json=payload,
                )
            return response.status_code < 400
        except httpx.HTTPError:
            return False

    async def connect(self, platform: str) -> dict[str, str]:
        key = platform.lower().replace("_", "-")
        # Accept wecom_ai alias
        if key in {"wecom_ai", "wecom_ai_bot"}:
            key = "wecom-ai"
        if key == "lark":
            key = "feishu"

        spec = PLATFORM_SPECS.get(key)
        if not spec:
            return {
                "platform": platform,
                "status": "unsupported",
                "credentialRef": f"cred_{platform}_none",
                "mode": self.mode,
            }

        if self.mode != "live":
            return self._mock_connect(key)

        astrbot_type = str(spec["astrbot_type"])
        remote = await self.list_remote_bots()
        existing = next(
            (
                bot
                for bot in remote
                if str(bot.get("type") or "") == astrbot_type and bot.get("enable")
            ),
            None,
        )
        if existing:
            return {
                "platform": key,
                "status": "connected",
                "credentialRef": f"cred_{key}_{uuid4().hex[:8]}",
                "mode": "live",
                "webUi": self.public_url,
                "botId": str(existing.get("id") or ""),
                "astrbotType": astrbot_type,
            }

        # Telegram keeps the previous live path (env token + optional dashboard register).
        if key == "telegram":
            bot = await self.verify_bot()
            if not bot:
                return self._setup_required(key, spec)
            payload = self._env_payload_for("telegram")
            if payload:
                await self._create_platform(payload)
            return {
                "platform": key,
                "status": "connected",
                "credentialRef": f"cred_{key}_{uuid4().hex[:8]}",
                "mode": "live",
                "webUi": self.public_url,
                "botUsername": bot.get("username") or "",
                "astrbotType": astrbot_type,
            }

        payload = self._env_payload_for(key)
        if payload:
            created = await self._create_platform(payload)
            if created:
                return {
                    "platform": key,
                    "status": "connected",
                    "credentialRef": f"cred_{key}_{uuid4().hex[:8]}",
                    "mode": "live",
                    "webUi": self.public_url,
                    "botId": str(payload.get("id") or ""),
                    "astrbotType": astrbot_type,
                }
            # Credentials present but AstrBot rejected create (missing adapter / auth).
            return {
                **self._setup_required(key, spec),
                "hint": (
                    f"Credentials were found, but AstrBot could not enable {astrbot_type}. "
                    "Open AstrBot Bots and create it with One-click QR, then Connect again."
                ),
            }

        return self._setup_required(key, spec)

    async def set_platform_enabled(self, platform: str, enabled: bool) -> dict[str, Any]:
        """Toggle AstrBot bot enable flag (Pause/Resume AI auto-reply)."""
        key = platform.lower().replace("_", "-")
        if key in {"wecom_ai", "wecom_ai_bot"}:
            key = "wecom-ai"
        if key == "lark":
            key = "feishu"

        spec = PLATFORM_SPECS.get(key)
        if not spec:
            return {"platform": platform, "ok": False, "reason": "unsupported"}

        if self.mode != "live":
            return {
                "platform": key,
                "ok": True,
                "enabled": enabled,
                "mode": "mock",
                "astrbotType": str(spec["astrbot_type"]),
            }

        astrbot_type = str(spec["astrbot_type"])
        remote = await self.list_remote_bots()
        match = next(
            (bot for bot in remote if str(bot.get("type") or "") == astrbot_type),
            None,
        )
        if not match or not match.get("id"):
            return {
                "platform": key,
                "ok": False,
                "reason": "bot_not_found",
                "astrbotType": astrbot_type,
            }

        bot_id = str(match["id"])
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.patch(
                    f"{self.base_url}/api/v1/bots/{bot_id}/enabled",
                    headers=self._auth_headers(),
                    json={"enabled": bool(enabled)},
                )
        except httpx.HTTPError as exc:
            return {
                "platform": key,
                "ok": False,
                "reason": f"http_error:{exc}",
                "botId": bot_id,
                "astrbotType": astrbot_type,
            }
        if response.status_code >= 400:
            return {
                "platform": key,
                "ok": False,
                "reason": f"status_{response.status_code}",
                "botId": bot_id,
                "astrbotType": astrbot_type,
            }
        return {
            "platform": key,
            "ok": True,
            "enabled": bool(enabled),
            "botId": bot_id,
            "mode": "live",
            "astrbotType": astrbot_type,
        }

    async def send_telegram(self, content: str, chat_id: str) -> dict | None:
        """Deliver via Telegram Bot API when TELEGRAM_BOT_TOKEN is set. Never returns the token."""
        if not self.telegram_bot_token or not chat_id:
            return None
        url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    url,
                    json={"chat_id": chat_id, "text": content[:4000]},
                )
        except httpx.HTTPError:
            return None
        if response.status_code >= 400:
            return None
        data = response.json() if response.content else {}
        result = data.get("result") if isinstance(data, dict) else {}
        message_id = (result or {}).get("message_id") if isinstance(result, dict) else None
        return {
            "threadId": str(chat_id),
            "message": {
                "id": str(message_id or f"tg-{uuid4().hex[:8]}"),
                "role": "assistant",
                "content": content[:120],
                "createdAt": "now",
            },
            "mode": "live",
        }


astrbot_client = AstrBotClient()
