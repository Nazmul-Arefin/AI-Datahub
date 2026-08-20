"""DeepSeek LLM adapter — live chat when DEEPSEEK_API_KEY is set, otherwise mock."""

from __future__ import annotations

from collections.abc import AsyncIterator

import httpx

from app.core.config import settings

DEFAULT_MODEL = "deepseek-v4-pro"


class DeepSeekClient:
    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        model: str | None = None,
    ) -> None:
        self.base_url = (base_url or settings.llm_deepseek_base_url).rstrip("/")
        self.api_key = settings.deepseek_api_key if api_key is None else api_key
        self.model = model or settings.llm_deepseek_model

    def _mock_reply(self, messages: list[dict]) -> dict:
        last = messages[-1]["content"] if messages else ""
        return {
            "role": "assistant",
            "content": f"[mock] received: {str(last)[:120]}",
            "mode": "mock",
            "model": self.model,
        }

    async def chat(self, messages: list[dict], *, max_tokens: int = 2048) -> dict:
        if not self.api_key:
            return self._mock_reply(messages)
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max(64, int(max_tokens or 2048)),
            "thinking": {"type": "disabled"},
        }
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        content = data["choices"][0]["message"]["content"]
        return {
            "role": "assistant",
            "content": content,
            "mode": "live",
            "model": self.model,
        }

    async def stream(self, messages: list[dict]) -> AsyncIterator[dict]:
        reply = await self.chat(messages)
        yield {"delta": reply["content"], "done": False, "mode": reply["mode"]}
        yield {"delta": "", "done": True, "mode": reply["mode"]}


deepseek_client = DeepSeekClient()
