from fastapi import APIRouter

from app.core.deps import CurrentUserId
from app.schemas.overview import OverviewResponse
from app.services.overview_service import overview_service

router = APIRouter()


@router.get("", response_model=OverviewResponse)
async def get_overview(_user_id: CurrentUserId) -> OverviewResponse:
    return overview_service.get_overview()
