import logging

from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUserId, DbSession
from app.schemas.sources import (
    GmailSendRequest,
    GmailSendResponse,
    Source,
    SourceListResponse,
    SourcePatchRequest,
    SourceReconnectRequest,
    SourceReconnectResponse,
    SourceSyncedListResponse,
    SourceSyncResponse,
)
from app.services.messaging_service import messaging_service
from app.services.source_service import source_service
from app.services.sync_service import sync_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=SourceListResponse)
async def list_sources(
    user_id: CurrentUserId,
    db: DbSession,
    category: str | None = Query(default="all"),
) -> SourceListResponse:
    return source_service.list_sources(category=category, db=db, user_id=user_id)


@router.get("/{source_id}", response_model=Source)
async def get_source(source_id: str, user_id: CurrentUserId, db: DbSession) -> Source:
    source = source_service.get_source(source_id, db=db, user_id=user_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    return source


@router.post("/gmail/send", response_model=GmailSendResponse)
async def send_gmail(
    payload: GmailSendRequest,
    _user_id: CurrentUserId,
    db: DbSession,
) -> GmailSendResponse:
    try:
        return await sync_service.send_gmail(payload, db=db)
    except PermissionError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.patch("/{source_id}", response_model=Source)
async def patch_source(
    source_id: str,
    payload: SourcePatchRequest,
    _user_id: CurrentUserId,
    db: DbSession,
) -> Source:
    source = source_service.patch_source(source_id, payload, db=db, user_id=_user_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    if payload.ai_enabled is not None:
        auth_type = source_service._auth_type_for(source, db=db)
        if auth_type == "astrbot":
            catalog_key = source_service._catalog_key_for(source, db=db) or source_id
            try:
                await messaging_service.set_platform_enabled(catalog_key, payload.ai_enabled)
            except Exception:
                logger.exception(
                    "Failed to toggle AstrBot platform %s enabled=%s",
                    catalog_key,
                    payload.ai_enabled,
                )
    return source


@router.post("/{source_id}/disconnect", response_model=Source)
async def disconnect_source(source_id: str, user_id: CurrentUserId, db: DbSession) -> Source:
    source = await source_service.disconnect_source(source_id, db=db, user_id=user_id)
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
    source = source_service.get_source(source_id, db=db, user_id=_user_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    items = sync_service.list_assets(source_id, db=db, limit=limit)
    return SourceSyncedListResponse(
        sourceId=source_id,
        total=len(items),
        storage="Postgres table synced_assets · optional JSON under backend/data/synced/",
        items=items,
    )
