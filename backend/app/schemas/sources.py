from datetime import datetime

from pydantic import BaseModel, Field


class SourceConnection(BaseModel):
    """Authorization state behind a source, shown on Import Data source cards.

    Distinct from `Source.status`, which describes sync health. A source can be
    syncing fine while its authorization needs attention, or vice versa.
    """

    id: str
    status: str = "pending"
    auth_provider: str = Field(default="nango", alias="authProvider")
    external_connection_id: str | None = Field(default=None, alias="externalConnectionId")
    error_message: str | None = Field(default=None, alias="errorMessage")
    connected_at: datetime | None = Field(default=None, alias="connectedAt")

    model_config = {"populate_by_name": True}


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
    connection_id: str | None = Field(default=None, alias="connectionId")
    connection: SourceConnection | None = None

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


class SourceReconnectRequest(BaseModel):
    redirect_uri: str | None = Field(default=None, alias="redirectUri")

    model_config = {"populate_by_name": True}


class SourceReconnectResponse(Source):
    """Result of a reconnect, as a superset of `Source` so clients that only
    read source fields keep working.

    `authorizationUrl` is set only when the provider grant is gone and the user
    has to authorize again — revoking a Nango or AstrBot connection destroys the
    upstream token, so it cannot be restored by flipping a status column.
    """

    authorization_url: str | None = Field(default=None, alias="authorizationUrl")
    state: str | None = None
    reauthorization_required: bool = Field(default=False, alias="reauthorizationRequired")


class IntegrationCatalogItem(BaseModel):
    id: str
    name: str
    category: str
    method: str
    description: str | None = None
    scopes: list[str] = Field(default_factory=list)
    auth_type: str = Field(default="nango", alias="authType")
    nango_provider_key: str | None = Field(default=None, alias="nangoProviderKey")
    logo_url: str | None = Field(default=None, alias="logoUrl")

    model_config = {"populate_by_name": True}


class IntegrationCatalogResponse(BaseModel):
    items: list[IntegrationCatalogItem]
    total: int = 0


class CatalogQuery(BaseModel):
    """Shared query params for GET /integrations/catalog."""

    q: str | None = None
    category: str | None = None


class IntegrationConnection(BaseModel):
    id: str
    catalog_key: str = Field(alias="catalogKey")
    auth_provider: str = Field(alias="authProvider")
    external_connection_id: str | None = Field(default=None, alias="externalConnectionId")
    status: str = "pending"
    error_message: str | None = Field(default=None, alias="errorMessage")

    model_config = {"populate_by_name": True}


class ConnectStartRequest(BaseModel):
    integration_id: str = Field(alias="integrationId")
    redirect_uri: str | None = Field(default=None, alias="redirectUri")

    model_config = {"populate_by_name": True}


class ConnectStartResponse(BaseModel):
    authorization_url: str = Field(alias="authorizationUrl")
    state: str
    setup_required: bool = Field(default=False, alias="setupRequired")
    setup_url: str | None = Field(default=None, alias="setupUrl")
    hint: str | None = None
    mode: str | None = None
    platform: str | None = None

    model_config = {"populate_by_name": True}


class SourceSyncItem(BaseModel):
    id: str
    external_id: str = Field(alias="externalId")
    object_type: str = Field(default="page", alias="objectType")
    title: str = "Untitled"
    url: str | None = None
    last_edited_at: str | None = Field(default=None, alias="lastEditedAt")
    synced_at: datetime | str | None = Field(default=None, alias="syncedAt")

    model_config = {"populate_by_name": True}


class SourceSyncResponse(BaseModel):
    source: Source
    provider: str
    fetched: int = 0
    created: int = 0
    updated: int = 0
    storage: str = "Postgres table synced_assets"
    items: list[SourceSyncItem] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class SourceSyncedListResponse(BaseModel):
    source_id: str = Field(alias="sourceId")
    total: int = 0
    storage: str = "Postgres table synced_assets"
    items: list[SourceSyncItem] = Field(default_factory=list)

    model_config = {"populate_by_name": True}
