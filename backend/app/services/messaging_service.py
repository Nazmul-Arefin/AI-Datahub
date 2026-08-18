"""Chat / mission messaging — wire to astrbot or harness."""


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


messaging_service = MessagingService()
