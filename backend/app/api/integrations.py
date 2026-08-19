from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.deps import CurrentUserId, DbSession, OptionalUserId
from app.schemas.sources import (
    CatalogQuery,
    ConnectStartRequest,
    ConnectStartResponse,
    IntegrationCatalogResponse,
    Source,
)
from app.services.auth_connector import auth_connector
from app.services.source_service import source_service

router = APIRouter()


@router.get("/catalog", response_model=IntegrationCatalogResponse)
async def integration_catalog(
    _user_id: CurrentUserId,
    db: DbSession,
    query: Annotated[CatalogQuery, Query()],
) -> IntegrationCatalogResponse:
    return source_service.integration_catalog(q=query.q, category=query.category, db=db)


@router.post("/connect", response_model=ConnectStartResponse)
async def start_connect(
    payload: ConnectStartRequest,
    user_id: CurrentUserId,
    db: DbSession,
) -> ConnectStartResponse:
    return await source_service.start_connect(payload, user_id, db=db)


@router.post("/{key}/connect", response_model=ConnectStartResponse)
async def start_connect_by_key(
    key: str,
    user_id: CurrentUserId,
    db: DbSession,
    redirect_uri: str | None = Query(default=None, alias="redirectUri"),
) -> ConnectStartResponse:
    payload = ConnectStartRequest(integrationId=key, redirectUri=redirect_uri)
    return await source_service.start_connect(payload, user_id, db=db)


@router.get("/callback", response_model=None)
async def oauth_callback(
    db: DbSession,
    user_id: OptionalUserId,
    code: str = Query(...),
    state: str = Query(...),
) -> RedirectResponse | Source:
    pending = source_service.pop_oauth_state(state, db=db)
    if not pending:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OAuth state")
    exchanged = await auth_connector.exchange_code(code, state, pending["user_id"] or user_id)
    source = await source_service.complete_connection(
        pending["catalog_key"],
        pending["user_id"] or user_id,
        state,
        provider=exchanged.get("provider", "nango"),
        external_connection_id=exchanged.get("externalConnectionId"),
        db=db,
    )
    redirect_uri = pending.get("redirect_uri") or f"{settings.frontend_url.rstrip('/')}/#/import-data"
    if redirect_uri.startswith("http"):
        joiner = "&" if "?" in redirect_uri else "?"
        if "#" in redirect_uri:
            base, fragment = redirect_uri.split("#", 1)
            fragment_joiner = "&" if "?" in fragment else "?"
            return RedirectResponse(url=f"{base}#{fragment}{fragment_joiner}connected={source.id}")
        return RedirectResponse(url=f"{redirect_uri}{joiner}connected={source.id}")
    return source
