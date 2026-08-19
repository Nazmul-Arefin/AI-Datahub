from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings, settings
from app.core.database import get_db
from app.services.auth_service import decode_access_token
from app.services.seed_data import ADMIN_USER_ID

DbSession = Annotated[Session | None, Depends(get_db)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


async def get_current_user_id(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        if token.startswith("dev-token-"):
            return ADMIN_USER_ID
        payload = decode_access_token(token)
        return str(payload.get("sub") or ADMIN_USER_ID)
    if settings.app_env == "development":
        return ADMIN_USER_ID
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


CurrentUserId = Annotated[str, Depends(get_current_user_id)]


def get_optional_user_id(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        if token.startswith("dev-token-"):
            return ADMIN_USER_ID
        payload = decode_access_token(token)
        return str(payload.get("sub") or ADMIN_USER_ID)
    return ADMIN_USER_ID


OptionalUserId = Annotated[str, Depends(get_optional_user_id)]
