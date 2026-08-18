"""DeepSeek LLM adapter."""

from app.core.config import settings


class DeepSeekClient:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = base_url or settings.llm_deepseek_base_url


deepseek_client = DeepSeekClient()
