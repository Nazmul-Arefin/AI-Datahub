from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status

from app.core.config import Settings, get_settings


def get_db() -> Generator[None, None, None]:
    """Database session placeholder — wire SQLAlchemy when USE_DATABASE=true."""
    yield None


DbSession = Annotated[None, Depends(get_db)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


async def get_current_user_id(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    """Stub auth — returns a fixed dev user until auth.py is implemented."""
    if authorization and authorization.startswith("Bearer "):
        return "dev-user"
    if get_settings().app_env == "development":
        return "dev-user"
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
