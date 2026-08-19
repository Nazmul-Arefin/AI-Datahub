import pytest


@pytest.mark.asyncio
async def test_login_issues_jwt(client):
    response = await client.post("/api/v1/auth/token", json={"username": "admin", "password": "weeple"})
    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {data['access_token']}"})
    assert me.status_code == 200
    profile = me.json()
    assert profile["id"] == "dev-user"


@pytest.mark.asyncio
async def test_invalid_token_returns_error_json(client):
    response = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "unauthorized"
