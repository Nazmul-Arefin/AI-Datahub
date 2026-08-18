from app.schemas.sources import (
    ConnectStartRequest,
    ConnectStartResponse,
    IntegrationCatalogResponse,
    Source,
    SourceListResponse,
    SourcePatchRequest,
)
from app.services.seed_data import INTEGRATION_CATALOG, SEED_SOURCES


class SourceService:
    def __init__(self) -> None:
        self._sources: dict[str, Source] = {
            source.id: source.model_copy(deep=True) for source in SEED_SOURCES
        }

    def list_sources(self, category: str | None = None) -> SourceListResponse:
        sources = list(self._sources.values())
        if category and category != "all":
            sources = [source for source in sources if source.category == category]
        return SourceListResponse(sources=sources, total=len(sources))

    def get_source(self, source_id: str) -> Source | None:
        return self._sources.get(source_id)

    def patch_source(self, source_id: str, payload: SourcePatchRequest) -> Source | None:
        source = self._sources.get(source_id)
        if not source:
            return None
        data = source.model_dump(by_alias=True)
        patch = payload.model_dump(exclude_unset=True, by_alias=True)
        data.update(patch)
        updated = Source.model_validate(data)
        self._sources[source_id] = updated
        return updated

    def disconnect_source(self, source_id: str) -> Source | None:
        return self.patch_source(
            source_id,
            SourcePatchRequest(
                aiEnabled=False,
                status="Revoked",
                statusType="revoked",
            ),
        )

    def reconnect_source(self, source_id: str) -> Source | None:
        return self.patch_source(
            source_id,
            SourcePatchRequest(
                aiEnabled=True,
                status="Connected",
                statusType="connected",
            ),
        )

    def integration_catalog(self) -> IntegrationCatalogResponse:
        return IntegrationCatalogResponse(items=INTEGRATION_CATALOG)

    def start_connect(self, payload: ConnectStartRequest) -> ConnectStartResponse:
        return ConnectStartResponse(
            authorizationUrl=f"https://connect.example/oauth/{payload.integration_id}",
            state=f"stub-{payload.integration_id}",
        )


source_service = SourceService()
