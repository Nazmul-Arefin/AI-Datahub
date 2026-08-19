"""T3: LLM ping through LLMService — no keys in responses, mock without DEEPSEEK_API_KEY."""

from __future__ import annotations

import pytest

from app.adapters.llm_deepseek.client import DeepSeekClient
from app.services.llm_service import LLMService


@pytest.mark.asyncio
async def test_llm_ping_is_mock_when_api_key_missing():
    client = DeepSeekClient(api_key="")
    result = await LLMService(client=client).ping()
    assert result["status"] == "ok"
    assert result["mode"] == "mock"
    assert result["model"]
    assert "api_key" not in result
    assert "apiKey" not in result
    blob = str(result).lower()
    assert "sk-" not in blob
    assert "bearer" not in blob


@pytest.mark.asyncio
async def test_llm_chat_uses_live_payload_when_key_and_http_ok(monkeypatch):
    async def fake_post(self, url, **kwargs):
        assert "Authorization" in kwargs["headers"]
        assert "sk-test" in kwargs["headers"]["Authorization"]
        class _Resp:
            status_code = 200

            def raise_for_status(self) -> None:
                return None

            def json(self) -> dict:
                return {
                    "choices": [{"message": {"role": "assistant", "content": "pong"}}]
                }

        return _Resp()

    monkeypatch.setattr("httpx.AsyncClient.post", fake_post)
    client = DeepSeekClient(api_key="sk-test", base_url="https://api.deepseek.com")
    chat = await client.chat([{"role": "user", "content": "ping"}])
    assert chat["mode"] == "live"
    assert chat["content"] == "pong"


@pytest.mark.asyncio
async def test_health_llm_endpoint_does_not_leak_secrets(client):
    response = await client.get("/api/v1/health/llm")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["mode"] in {"mock", "live"}
    assert "apiKey" not in data
    assert "api_key" not in data
    assert "sk-" not in str(data)
