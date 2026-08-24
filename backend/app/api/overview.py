from fastapi import APIRouter

from app.core.deps import CurrentUserId, DbSession
from app.schemas.overview import OverviewResponse
from app.services.overview_service import overview_service

router = APIRouter()


@router.get("", response_model=OverviewResponse)
async def get_overview(user_id: CurrentUserId, db: DbSession) -> OverviewResponse:
    return overview_service.get_overview(db=db, user_id=user_id)
