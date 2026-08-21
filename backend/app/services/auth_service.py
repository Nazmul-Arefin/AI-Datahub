from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac
from hmac import compare_digest
from secrets import token_hex
from uuid import uuid4

import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse, UserProfile
from app.services.runtime_store import runtime_store
from app.services.seed_data import ADMIN_USER_ID

_PBKDF2_PREFIX = "pbkdf2_sha256$"
_PBKDF2_ITERATIONS = 260_000


def create_access_token(user_id: str, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "username": username, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def hash_password(password: str) -> str:
    salt = token_hex(16)
    digest = pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), _PBKDF2_ITERATIONS).hex()
    return f"{_PBKDF2_PREFIX}{_PBKDF2_ITERATIONS}${salt}${digest}"


def _looks_hashed(value: str | None) -> bool:
    text = str(value or "")
    return text.startswith(_PBKDF2_PREFIX) or text.startswith("$2a$") or text.startswith("$2b$") or text.startswith("$2y$")


def _verify_pbkdf2(password: str, stored: str) -> bool:
    try:
        _, iterations_s, salt, digest = stored.split("$", 3)
        iterations = int(iterations_s)
    except ValueError:
        return False
    candidate = pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()
    return compare_digest(candidate, digest)


def _verify_bcrypt(password: str, stored: str) -> bool:
    try:
        import bcrypt
    except ImportError:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), stored.encode("utf-8"))
    except ValueError:
        return False


def verify_password(password: str, password_hash: str | None) -> bool:
    stored = str(password_hash or "")
    if not stored:
        return False
    if stored.startswith(_PBKDF2_PREFIX):
        return _verify_pbkdf2(password, stored)
    if stored.startswith("$2a$") or stored.startswith("$2b$") or stored.startswith("$2y$"):
        return _verify_bcrypt(password, stored)
    # Legacy plaintext seed passwords — accept once, then re-hash on login.
    return stored == password


def _token_for(user_id: str, username: str) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(user_id, username), token_type="bearer")


def _find_runtime_user(username: str) -> dict | None:
    users = getattr(runtime_store, "users", {}) or {}
    for user in users.values():
        if str(user.get("username") or "").lower() == username.lower():
            return user
    return None


def _save_runtime_user(user: dict) -> None:
    if not hasattr(runtime_store, "users") or runtime_store.users is None:
        runtime_store.users = {}
    runtime_store.users[user["id"]] = user


def authenticate(username: str, password: str, db: Session | None = None) -> TokenResponse:
    if username == settings.admin_username and password == settings.admin_password:
        return _token_for(ADMIN_USER_ID, username)

    if db is not None:
        user = db.query(User).filter(User.username == username).one_or_none()
        if user and verify_password(password, user.password_hash):
            if not _looks_hashed(user.password_hash) or (
                user.password_hash.startswith("$2") and not user.password_hash.startswith(_PBKDF2_PREFIX)
            ):
                # Prefer pbkdf2 for new writes when bcrypt may be unavailable.
                if not str(user.password_hash or "").startswith(_PBKDF2_PREFIX):
                    user.password_hash = hash_password(password)
            return _token_for(user.id, user.username)

    runtime_user = _find_runtime_user(username)
    if runtime_user and verify_password(password, runtime_user.get("password_hash")):
        if not str(runtime_user.get("password_hash") or "").startswith(_PBKDF2_PREFIX):
            runtime_user["password_hash"] = hash_password(password)
            _save_runtime_user(runtime_user)
        return _token_for(str(runtime_user["id"]), str(runtime_user["username"]))

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")


def register_user(payload: RegisterRequest, db: Session | None = None) -> TokenResponse:
    username = payload.username
    display_name = payload.display_name or username
    password_hash = hash_password(payload.password)

    if username == settings.admin_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )

    if db is not None:
        existing = db.query(User).filter(User.username == username).one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username is already taken",
            )
        user_id = str(uuid4())
        db.add(
            User(
                id=user_id,
                username=username,
                password_hash=password_hash,
                display_name=display_name,
            )
        )
        db.flush()
        return _token_for(user_id, username)

    if _find_runtime_user(username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken",
        )
    user_id = str(uuid4())
    _save_runtime_user(
        {
            "id": user_id,
            "username": username,
            "password_hash": password_hash,
            "display_name": display_name,
        }
    )
    return _token_for(user_id, username)


def get_profile(user_id: str, db: Session | None = None) -> UserProfile:
    if db is not None:
        user = db.query(User).filter(User.id == user_id).one_or_none()
        if user:
            return UserProfile(id=user.id, username=user.username, display_name=user.display_name)

    users = getattr(runtime_store, "users", {}) or {}
    runtime_user = users.get(user_id)
    if runtime_user:
        return UserProfile(
            id=str(runtime_user["id"]),
            username=str(runtime_user.get("username") or ""),
            display_name=str(runtime_user.get("display_name") or runtime_user.get("username") or "User"),
        )

    if user_id == ADMIN_USER_ID:
        return UserProfile(id=user_id, username=settings.admin_username, display_name="Dev User")
    return UserProfile(id=user_id, username=settings.admin_username, display_name="Dev User")
