from pydantic import BaseModel


class ChatMessage(BaseModel):
    id: str
    role: str
    content: str
    created_at: str | None = None


class SendMessageRequest(BaseModel):
    content: str
    thread_id: str | None = None


class SendMessageResponse(BaseModel):
    message: ChatMessage
    thread_id: str
