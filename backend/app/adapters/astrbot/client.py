"""AstrBot messaging adapter — live WebUI ping, mock connect unless a bot token exists."""

from __future__ import annotations

from uuid import uuid4

import httpx

from app.core.config import settings

PLATFORMS = (
    {"id": "telegram", "name": "Telegram", "status": "available"},
    {"id": "discord", "name": "Discord", "status": "available"},
)

TELEGRAM_TOOLS = [
    {
        "name": "list_chats",
        "description": "List recent Telegram chats for the connected bot",
        "confirmationRequired": False,
    },
    {
        "name": "send_message",
        "description": "Send a Telegram message (high-impact; requires confirm=true)",
        "confirmationRequired": True,
    },
]


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

    async def ping(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
                response = await client.get(self.base_url)
            return response.status_code < 500
        except httpx.HTTPError:
            return False

    async def list_platforms(self) -> list[dict[str, str]]:
        return [dict(item) for item in PLATFORMS]

    def _mock_connect(self, platform: str) -> dict[str, str]:
        return {
            "platform": platform,
            "status": "connected",
            "credentialRef": f"cred_{platform}_{uuid4().hex[:8]}",
            "mode": "mock",
            "webUi": self.public_url,
        }

    async def connect(self, platform: str) -> dict[str, str]:
        key = platform.lower()
        if key not in {item["id"] for item in PLATFORMS}:
            return {
                "platform": platform,
                "status": "unsupported",
                "credentialRef": f"cred_{platform}_none",
                "mode": self.mode,
            }
        if self.mode != "live" or key != "telegram" or not self.telegram_bot_token:
            return self._mock_connect(platform)
        payload = {
            "id": "telegram-weeple",
            "type": "telegram",
            "enable": True,
            "telegram_token": self.telegram_bot_token,
        }
        headers = {"Content-Type": "application/json"}
        if self.dashboard_token:
            headers["Authorization"] = f"Bearer {self.dashboard_token}"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/config/platform/new",
                    headers=headers,
                    json=payload,
                )
            if response.status_code >= 400:
                return self._mock_connect(platform)
        except httpx.HTTPError:
            return self._mock_connect(platform)
        return {
            "platform": platform,
            "status": "connected",
            "credentialRef": f"cred_{platform}_{uuid4().hex[:8]}",
            "mode": "live",
            "webUi": self.public_url,
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
