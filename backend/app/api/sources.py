from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUserId, DbSession
from app.schemas.sources import (
    Source,
    SourceListResponse,
    SourcePatchRequest,
    SourceReconnectRequest,
    SourceReconnectResponse,
    SourceSyncedListResponse,
    SourceSyncResponse,
)
from app.services.source_service import source_service
from app.services.sync_service import sync_service

router = APIRouter()


@router.get("", response_model=SourceListResponse)
async def list_sources(
    _user_id: CurrentUserId,
    db: DbSession,
    category: str | None = Query(default="all"),
) -> SourceListResponse:
    return source_service.list_sources(category=category, db=db)


@router.get("/{source_id}", response_model=Source)
async def get_source(source_id: str, _user_id: CurrentUserId, db: DbSession) -> Source:
    source = source_service.get_source(source_id, db=db)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.patch("/{source_id}", response_model=Source)
async def patch_source(
    source_id: str,
    payload: SourcePatchRequest,
    _user_id: CurrentUserId,
    db: DbSession,
) -> Source:
    source = source_service.patch_source(source_id, payload, db=db)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.post("/{source_id}/disconnect", response_model=Source)
async def disconnect_source(source_id: str, _user_id: CurrentUserId, db: DbSession) -> Source:
    source = await source_service.disconnect_source(source_id, db=db)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.post("/{source_id}/reconnect", response_model=SourceReconnectResponse)
async def reconnect_source(
    source_id: str,
    user_id: CurrentUserId,
    db: DbSession,
    payload: SourceReconnectRequest | None = None,
) -> SourceReconnectResponse:
    source = await source_service.reconnect_source(
        source_id,
        user_id=user_id,
        redirect_uri=payload.redirect_uri if payload else None,
        db=db,
    )
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.post("/{source_id}/sync", response_model=SourceSyncResponse)
async def sync_source(source_id: str, _user_id: CurrentUserId, db: DbSession) -> SourceSyncResponse:
    try:
        return await sync_service.sync_source(source_id, db=db)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.get("/{source_id}/synced-assets", response_model=SourceSyncedListResponse)
async def list_synced_assets(
    source_id: str,
    _user_id: CurrentUserId,
    db: DbSession,
    limit: int = Query(default=100, ge=1, le=500),
) -> SourceSyncedListResponse:
    source = source_service.get_source(source_id, db=db)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    items = sync_service.list_assets(source_id, db=db, limit=limit)
    return SourceSyncedListResponse(
        sourceId=source_id,
        total=len(items),
        storage="Postgres table synced_assets · optional JSON under backend/data/synced/",
        items=items,
    )
