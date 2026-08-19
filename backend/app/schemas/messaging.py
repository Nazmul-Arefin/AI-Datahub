from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    id: str
    role: str
    content: str
    created_at: str | None = Field(default=None, alias="createdAt")

    model_config = {"populate_by_name": True}


class SendMessageRequest(BaseModel):
    content: str
    thread_id: str | None = Field(default=None, alias="threadId")

    model_config = {"populate_by_name": True}


class SendMessageResponse(BaseModel):
    message: ChatMessage
    thread_id: str = Field(alias="threadId")

    model_config = {"populate_by_name": True}


class MessagingPlatform(BaseModel):
    id: str
    name: str
    status: str


class MessagingPlatformListResponse(BaseModel):
    platforms: list[MessagingPlatform]
    mode: str = "mock"
    web_ui: str | None = Field(default=None, alias="webUi")
    role: str = "messaging"

    model_config = {"populate_by_name": True}


class MessagingCard(BaseModel):
    title: str
    platform: str
    status: str
    source_id: str | None = Field(default=None, alias="sourceId")
    mcp_server_id: str | None = Field(default=None, alias="mcpServerId")

    model_config = {"populate_by_name": True}


class MessagingConnectResponse(BaseModel):
    platform: str
    status: str
    credential_ref: str = Field(alias="credentialRef")
    mode: str = "mock"
    source_id: str | None = Field(default=None, alias="sourceId")
    mcp_server_id: str | None = Field(default=None, alias="mcpServerId")
    card: MessagingCard | None = None
    web_ui: str | None = Field(default=None, alias="webUi")

    model_config = {"populate_by_name": True}


class MessagingSource(BaseModel):
    id: str
    platform: str
    kind: str = "messaging"
    status: str
    mcp_server_id: str | None = Field(default=None, alias="mcpServerId")
    credential_ref: str | None = Field(default=None, alias="credentialRef")
    mode: str | None = None

    model_config = {"populate_by_name": True}


class MessagingSourceListResponse(BaseModel):
    sources: list[MessagingSource]
