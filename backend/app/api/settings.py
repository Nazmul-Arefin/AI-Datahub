from fastapi import APIRouter

from app.core.deps import CurrentUserId
from app.schemas.settings import SystemSettings, SystemSettingsPatchRequest
from app.services.settings_service import settings_service

router = APIRouter()


@router.get("", response_model=SystemSettings)
async def get_settings(user_id: CurrentUserId) -> SystemSettings:
    return settings_service.get_settings(user_id)


@router.patch("", response_model=SystemSettings)
async def patch_settings(
    payload: SystemSettingsPatchRequest,
    user_id: CurrentUserId,
) -> SystemSettings:
    return settings_service.patch_settings(user_id, payload)
