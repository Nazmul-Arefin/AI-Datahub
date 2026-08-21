import pytest

from app.services.auth_service import _looks_hashed, hash_password, verify_password
from app.services.runtime_store import runtime_store


@pytest.mark.asyncio
async def test_login_issues_jwt(client):
    response = await client.post("/api/v1/auth/token", json={"username": "admin", "password": "weeple"})
    assert response.status_code == 200
    data = response.json()
    assert data["tokenType"] == "bearer"
    assert data["accessToken"]

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {data['accessToken']}"})
    assert me.status_code == 200
    profile = me.json()
    assert profile["id"] == "dev-user"
    assert profile["displayName"]


@pytest.mark.asyncio
async def test_invalid_token_returns_error_json(client):
    response = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "unauthorized"


@pytest.mark.asyncio
async def test_register_returns_token_and_me(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={"username": "nova", "password": "secret12", "displayName": "Nova"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["accessToken"]
    assert data["tokenType"] == "bearer"

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {data['accessToken']}"})
    assert me.status_code == 200
    profile = me.json()
    assert profile["username"] == "nova"
    assert profile["displayName"] == "Nova"


@pytest.mark.asyncio
async def test_register_duplicate_username(client):
    first = await client.post(
        "/api/v1/auth/register",
        json={"username": "twin", "password": "secret12"},
    )
    assert first.status_code == 200
    second = await client.post(
        "/api/v1/auth/register",
        json={"username": "twin", "password": "secret99"},
    )
    assert second.status_code == 409
    body = second.json()
    assert body["error"]["code"] == "conflict"


@pytest.mark.asyncio
async def test_bad_login_rejected(client):
    await client.post(
        "/api/v1/auth/register",
        json={"username": "locked", "password": "secret12"},
    )
    response = await client.post(
        "/api/v1/auth/token",
        json={"username": "locked", "password": "wrong-pass"},
    )
    assert response.status_code == 401
    body = response.json()
    assert body["error"]["code"] == "unauthorized"


@pytest.mark.asyncio
async def test_register_stores_hashed_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={"username": "hashed", "password": "secret12", "displayName": "Hashed"},
    )
    stored = next(
        (user for user in runtime_store.users.values() if user["username"] == "hashed"),
        None,
    )
    assert stored is not None
    assert stored["password_hash"] != "secret12"
    assert _looks_hashed(stored["password_hash"])
    assert stored["password_hash"].startswith("pbkdf2_sha256$")
    assert verify_password("secret12", stored["password_hash"])


def test_password_helpers_round_trip():
    hashed = hash_password("weeple")
    assert _looks_hashed(hashed)
    assert hashed.startswith("pbkdf2_sha256$")
    assert verify_password("weeple", hashed)
    assert not verify_password("nope", hashed)
    assert verify_password("legacy", "legacy")
    assert not verify_password("legacy", "other")
