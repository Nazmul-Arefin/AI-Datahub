from pydantic import BaseModel, Field


class Source(BaseModel):
    id: str
    name: str
    category: str
    type: str | None = None
    method: str | None = None
    status: str = "Connected"
    status_type: str = Field(default="connected", alias="statusType")
    last_sync: str = Field(default="Unknown", alias="lastSync")
    assets: str = "0 signals"
    scopes: list[str] = Field(default_factory=list)
    purposes: list[str] = Field(default_factory=list)
    used_by: str | None = Field(default=None, alias="usedBy")
    ai_enabled: bool = Field(default=True, alias="aiEnabled")

    model_config = {"populate_by_name": True}


class SourceListResponse(BaseModel):
    sources: list[Source]
    total: int
    assets_processed_today: int = Field(default=42, alias="assetsProcessedToday")

    model_config = {"populate_by_name": True}


class SourcePatchRequest(BaseModel):
    ai_enabled: bool | None = Field(default=None, alias="aiEnabled")
    status: str | None = None
    status_type: str | None = Field(default=None, alias="statusType")

    model_config = {"populate_by_name": True}


class IntegrationCatalogItem(BaseModel):
    id: str
    name: str
    category: str
    method: str
    description: str | None = None
    scopes: list[str] = Field(default_factory=list)


class IntegrationCatalogResponse(BaseModel):
    items: list[IntegrationCatalogItem]


class ConnectStartRequest(BaseModel):
    integration_id: str = Field(alias="integrationId")
    redirect_uri: str | None = Field(default=None, alias="redirectUri")

    model_config = {"populate_by_name": True}


class ConnectStartResponse(BaseModel):
    authorization_url: str = Field(alias="authorizationUrl")
    state: str

    model_config = {"populate_by_name": True}
