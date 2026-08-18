from fastapi import APIRouter

from app.schemas.auth import TokenRequest, TokenResponse, UserProfile
from app.core.deps import CurrentUserId

router = APIRouter()


@router.post("/token", response_model=TokenResponse)
async def login(payload: TokenRequest) -> TokenResponse:
    return TokenResponse(access_token=f"dev-token-{payload.username}")


@router.get("/me", response_model=UserProfile)
async def me(user_id: CurrentUserId) -> UserProfile:
    return UserProfile(id=user_id, display_name="Dev User")
