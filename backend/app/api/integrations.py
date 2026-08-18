from fastapi import APIRouter, Query

from app.core.deps import CurrentUserId
from app.schemas.common import MessageResponse
from app.schemas.sources import ConnectStartRequest, ConnectStartResponse, IntegrationCatalogResponse
from app.services.auth_connector import auth_connector
from app.services.source_service import source_service

router = APIRouter()


@router.get("/catalog", response_model=IntegrationCatalogResponse)
async def integration_catalog(_user_id: CurrentUserId) -> IntegrationCatalogResponse:
    return source_service.integration_catalog()


@router.post("/connect", response_model=ConnectStartResponse)
async def start_connect(
    payload: ConnectStartRequest,
    _user_id: CurrentUserId,
) -> ConnectStartResponse:
    return source_service.start_connect(payload)


@router.get("/callback")
async def oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    _user_id: CurrentUserId = ...,
) -> MessageResponse:
    await auth_connector.exchange_code(code, state)
    return MessageResponse(message="Integration connected (stub)")
