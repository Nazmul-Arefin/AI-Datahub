import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.runtime_store import runtime_store


@pytest.fixture(autouse=True)
def reset_runtime_store():
    runtime_store.reset()
    yield
    runtime_store.reset()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
