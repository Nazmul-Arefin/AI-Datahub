from pydantic import BaseModel, Field


class McpTool(BaseModel):
    name: str
    description: str | None = None
    confirmation_required: bool | None = Field(default=None, alias="confirmationRequired")

    model_config = {"populate_by_name": True}


class McpServer(BaseModel):
    server_id: str = Field(alias="serverId")
    name: str
    connection_id: str | None = Field(default=None, alias="connectionId")
    tools: list[McpTool] = Field(default_factory=list)
    mode: str | None = None

    model_config = {"populate_by_name": True}


class McpCatalogResponse(BaseModel):
    servers: list[McpServer]
    mode: str | None = None


class McpRegisterRequest(BaseModel):
    connection_id: str = Field(alias="connectionId")
    name: str = "github"
    tools: list[McpTool] | None = None
    credential_ref: str | None = Field(default=None, alias="credentialRef")

    model_config = {"populate_by_name": True}


class McpRegisterResponse(BaseModel):
    server_id: str = Field(alias="serverId")
    name: str
    connection_id: str | None = Field(default=None, alias="connectionId")
    tools: list[McpTool] = Field(default_factory=list)
    mode: str | None = None

    model_config = {"populate_by_name": True}


class McpToolListResponse(BaseModel):
    server_id: str = Field(alias="serverId")
    tools: list[McpTool]
    mode: str | None = None

    model_config = {"populate_by_name": True}


class McpInvokeRequest(BaseModel):
    tool: str
    args: dict | None = None
    server_id: str | None = Field(default=None, alias="serverId")

    model_config = {"populate_by_name": True}


class McpInvokeResponse(BaseModel):
    ok: bool
    tool: str
    args: dict = Field(default_factory=dict)
    result: dict = Field(default_factory=dict)
    error: dict | None = None
    audit_id: str | None = Field(default=None, alias="auditId")
    mode: str | None = None

    model_config = {"populate_by_name": True}


class McpAuditResponse(BaseModel):
    events: list[dict]
    total: int
    sink: str
