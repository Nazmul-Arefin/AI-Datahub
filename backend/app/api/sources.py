from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUserId
from app.schemas.common import MessageResponse
from app.schemas.sources import Source, SourceListResponse, SourcePatchRequest
from app.services.source_service import source_service

router = APIRouter()


@router.get("", response_model=SourceListResponse)
async def list_sources(
    _user_id: CurrentUserId,
    category: str | None = Query(default="all"),
) -> SourceListResponse:
    return source_service.list_sources(category=category)


@router.get("/{source_id}", response_model=Source)
async def get_source(source_id: str, _user_id: CurrentUserId) -> Source:
    source = source_service.get_source(source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.patch("/{source_id}", response_model=Source)
async def patch_source(
    source_id: str,
    payload: SourcePatchRequest,
    _user_id: CurrentUserId,
) -> Source:
    source = source_service.patch_source(source_id, payload)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.post("/{source_id}/disconnect", response_model=Source)
async def disconnect_source(source_id: str, _user_id: CurrentUserId) -> Source:
    source = source_service.disconnect_source(source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.post("/{source_id}/reconnect", response_model=Source)
async def reconnect_source(source_id: str, _user_id: CurrentUserId) -> Source:
    source = source_service.reconnect_source(source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source
