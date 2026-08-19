import os

import pytest
from httpx import ASGITransport, AsyncClient

# Unit/API tests must not call live DeepSeek even if a local .env has a key.
os.environ["DEEPSEEK_API_KEY"] = ""
os.environ["MCP_GATEWAY_MODE"] = "mock"
os.environ["HARNESS_MODE"] = "mock"
os.environ["ASTRBOT_MODE"] = "mock"
os.environ["MEMORY_MODE"] = "mock"

from app.main import app  # noqa: E402


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
