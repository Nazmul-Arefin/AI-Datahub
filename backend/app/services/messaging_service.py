"""Chat / mission messaging — Dev2 wires AstrBot adapter."""

from app.core.config import settings
from app.schemas.sources import ConnectStartResponse


class MessagingService:
    async def send(self, content: str, thread_id: str | None = None) -> dict:
        tid = thread_id or "thread-stub-1"
        return {
            "threadId": tid,
            "message": {
                "id": "msg-stub-1",
                "role": "assistant",
                "content": f"Received: {content[:120]}",
                "createdAt": "now",
            },
        }

    async def connect_platform(
        self,
        platform: str,
        redirect_uri: str | None,
        user_id: str,
        state: str,
    ) -> ConnectStartResponse:
        callback = (
            f"{settings.api_public_url.rstrip('/')}/integrations/callback"
            f"?code=astrbot-ok&state={state}"
        )
        return ConnectStartResponse(authorizationUrl=callback, state=state)

    async def list_platforms(self) -> list[dict[str, str]]:
        return [
            {"id": "telegram", "name": "Telegram", "status": "available"},
            {"id": "discord", "name": "Discord", "status": "available"},
        ]


messaging_service = MessagingService()
