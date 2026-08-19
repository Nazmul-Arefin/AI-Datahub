from fastapi import APIRouter

from app.core.deps import CurrentUserId
from app.schemas.messaging import (
    ChatMessage,
    MessagingConnectResponse,
    MessagingPlatformListResponse,
    MessagingSourceListResponse,
    SendMessageRequest,
    SendMessageResponse,
)
from app.services.messaging_service import messaging_service

router = APIRouter()


@router.get("/platforms", response_model=MessagingPlatformListResponse)
async def list_platforms(_user_id: CurrentUserId) -> MessagingPlatformListResponse:
    result = await messaging_service.list_platforms()
    return MessagingPlatformListResponse.model_validate(result)


@router.get("/sources", response_model=MessagingSourceListResponse)
async def list_messaging_sources(_user_id: CurrentUserId) -> MessagingSourceListResponse:
    result = await messaging_service.list_sources()
    return MessagingSourceListResponse.model_validate(result)


@router.post("/{platform}/connect", response_model=MessagingConnectResponse)
async def connect_platform(platform: str, _user_id: CurrentUserId) -> MessagingConnectResponse:
    result = await messaging_service.connect(platform)
    return MessagingConnectResponse.model_validate(result)


@router.post("/messages", response_model=SendMessageResponse)
async def send_message(payload: SendMessageRequest, _user_id: CurrentUserId) -> SendMessageResponse:
    result = await messaging_service.send(payload.content, payload.thread_id)
    msg = result["message"]
    return SendMessageResponse(
        thread_id=result["threadId"],
        message=ChatMessage(
            id=msg["id"],
            role=msg["role"],
            content=msg["content"],
            created_at=msg.get("createdAt"),
        ),
    )
