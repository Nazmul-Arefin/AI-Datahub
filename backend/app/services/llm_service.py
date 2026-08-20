"""Shared LLM access — DeepSeek via LLMService. Mock when no live key."""

from collections.abc import AsyncIterator

from app.adapters.llm_deepseek.client import deepseek_client


class LLMService:
    def __init__(self, client=deepseek_client) -> None:
        self._client = client

    async def chat(self, messages: list[dict], *, max_tokens: int = 2048) -> dict:
        return await self._client.chat(messages, max_tokens=max_tokens)

    async def stream(self, messages: list[dict]) -> AsyncIterator[dict]:
        async for chunk in self._client.stream(messages):
            yield chunk

    async def ping(self) -> dict:
        reply = await self.chat(
            [{"role": "user", "content": "Reply with the single word pong."}]
        )
        preview = str(reply.get("content", ""))[:80]
        return {
            "status": "ok",
            "mode": reply.get("mode", "mock"),
            "model": reply.get("model", "deepseek-chat"),
            "preview": preview,
        }


llm_service = LLMService()
