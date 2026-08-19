from fastapi import APIRouter

from app.core.deps import CurrentUserId, DbSession
from app.schemas.auth import TokenRequest, TokenResponse, UserProfile
from app.services.auth_service import authenticate, get_profile

router = APIRouter()


@router.post("/token", response_model=TokenResponse)
async def login(payload: TokenRequest, db: DbSession) -> TokenResponse:
    return authenticate(payload.username, payload.password, db=db)


@router.get("/me", response_model=UserProfile)
async def me(user_id: CurrentUserId, db: DbSession) -> UserProfile:
    return get_profile(user_id, db=db)
