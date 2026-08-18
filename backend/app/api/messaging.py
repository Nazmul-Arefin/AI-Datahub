from fastapi import APIRouter

from app.core.deps import CurrentUserId
from app.schemas.messaging import ChatMessage, SendMessageRequest, SendMessageResponse
from app.services.messaging_service import messaging_service

router = APIRouter()


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
