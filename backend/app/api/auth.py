from fastapi import APIRouter

from app.core.deps import CurrentUserId, DbSession
from app.schemas.auth import RegisterRequest, TokenRequest, TokenResponse, UserProfile
from app.services.auth_service import authenticate, get_profile, register_user

router = APIRouter()


@router.post("/token", response_model=TokenResponse)
async def login(payload: TokenRequest, db: DbSession) -> TokenResponse:
    return authenticate(payload.username, payload.password, db=db)


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: DbSession) -> TokenResponse:
    return register_user(payload, db=db)


@router.get("/me", response_model=UserProfile)
async def me(user_id: CurrentUserId, db: DbSession) -> UserProfile:
    return get_profile(user_id, db=db)
