from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.schemas.auth import TokenResponse, UserProfile
from app.services.seed_data import ADMIN_USER_ID


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


def authenticate(username: str, password: str, db: Session | None = None) -> TokenResponse:
    if username == settings.admin_username and password == settings.admin_password:
        token = create_access_token(ADMIN_USER_ID, username)
        return TokenResponse(access_token=token)

    if db is not None:
        user = db.query(User).filter(User.username == username).one_or_none()
        if user and user.password_hash and user.password_hash == password:
            token = create_access_token(user.id, user.username)
            return TokenResponse(access_token=token)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")


def get_profile(user_id: str, db: Session | None = None) -> UserProfile:
    if db is not None:
        user = db.query(User).filter(User.id == user_id).one_or_none()
        if user:
            return UserProfile(id=user.id, username=user.username, display_name=user.display_name)
    return UserProfile(id=user_id, username=settings.admin_username, display_name="Dev User")
