from fastapi import APIRouter, Query

from app.core.deps import CurrentUserId, DbSession
from app.schemas.search import SearchResponse
from app.services.search_service import search_service

router = APIRouter()


@router.get("", response_model=SearchResponse)
async def search(
    _user_id: CurrentUserId,
    db: DbSession,
    q: str = Query(default="", min_length=0),
    limit: int = Query(default=20, ge=1, le=40),
) -> SearchResponse:
    return await search_service.search(q, db=db, limit=limit, user_id=_user_id)
