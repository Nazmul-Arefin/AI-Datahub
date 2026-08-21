import logging
from uuid import uuid4

from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.models.source import DataSource, IntegrationCatalog, IntegrationConnection, OAuthState
from app.models.base import utcnow
from app.schemas.sources import (
    ConnectStartRequest,
    ConnectStartResponse,
    IntegrationCatalogItem,
    IntegrationCatalogResponse,
    Source,
    SourceConnection,
    SourceListResponse,
    SourcePatchRequest,
    SourceReconnectResponse,
)
from app.services.activity_service import activity_service
from app.services.auth_connector import auth_connector
from app.services.mcp_service import mcp_service
from app.services.messaging_service import messaging_service
from app.services.runtime_store import expires_in, runtime_store
from app.services.seed_data import ADMIN_USER_ID, CATALOG_SOURCE_IDS, SOURCE_CATALOG_KEYS

logger = logging.getLogger(__name__)

# Auth types whose grant lives at a third party. Revoking destroys the upstream
# token, so restoring access means walking the connect flow again.
REAUTH_AUTH_TYPES = frozenset({"nango", "astrbot"})


def _connection_from_row(row: IntegrationConnection) -> SourceConnection:
    return SourceConnection(
        id=row.id,
        status=row.status,
        authProvider=row.auth_provider,
        externalConnectionId=row.external_connection_id,
        errorMessage=row.error_message,
        connectedAt=row.connected_at,
    )


def _connection_from_record(record: dict) -> SourceConnection:
    return SourceConnection(
        id=record["id"],
        status=record.get("status", "pending"),
        authProvider=record.get("auth_provider", "nango"),
        externalConnectionId=record.get("external_connection_id"),
        errorMessage=record.get("error_message"),
        connectedAt=record.get("connected_at"),
    )


def _source_from_row(row: DataSource) -> Source:
    return Source.model_validate(
        {
            "id": row.id,
            "name": row.name,
            "category": row.category,
            "type": row.type,
            "method": row.method,
            "status": row.status,
            "statusType": row.status_type,
            "lastSync": row.last_sync,
            "assets": row.assets,
            "scopes": row.scopes or [],
            "purposes": row.purposes or [],
            "usedBy": row.used_by,
            "aiEnabled": row.ai_enabled,
            "connectionId": row.connection_id,
            "connection": _connection_from_row(row.connection) if row.connection else None,
        }
    )


def _catalog_from_row(row: IntegrationCatalog) -> IntegrationCatalogItem:
    return IntegrationCatalogItem(
        id=row.key,
        name=row.name,
        category=row.category,
        method=row.method,
        description=row.description,
        scopes=row.scopes or [],
        authType=row.auth_type,
        nangoProviderKey=row.nango_provider_key,
        logoUrl=row.logo_url,
    )


def _apply_source_row(row: DataSource, source: Source) -> None:
    row.name = source.name
    row.category = source.category
    row.type = source.type
    row.method = source.method
    row.status = source.status
    row.status_type = source.status_type
    row.last_sync = source.last_sync
    row.assets = source.assets
    row.scopes = list(source.scopes)
    row.purposes = list(source.purposes)
    row.used_by = source.used_by
    row.ai_enabled = source.ai_enabled
    row.connection_id = source.connection_id


class SourceService:
    def _attach_connection(self, source: Source, db: Session | None) -> Source:
        """Resolve the authorization record so cards can show connection state."""
        if not source.connection_id:
            source.connection = None
            return source
        if db is not None:
            row = db.get(IntegrationConnection, source.connection_id)
            source.connection = _connection_from_row(row) if row else None
        else:
            record = runtime_store.connections.get(source.connection_id)
            source.connection = _connection_from_record(record) if record else None
        return source

    def list_sources(self, category: str | None = None, db: Session | None = None) -> SourceListResponse:
        if db is not None:
            query = db.query(DataSource).options(selectinload(DataSource.connection))
            if category and category != "all":
                query = query.filter(DataSource.category == category)
            sources = [_source_from_row(row) for row in query.order_by(DataSource.name, DataSource.id).all()]
        else:
            sources = list(runtime_store.sources.values())
            if category and category != "all":
                sources = [source for source in sources if source.category == category]
            sources = [self._attach_connection(source, db) for source in sources]
        return SourceListResponse(sources=sources, total=len(sources))

    def get_source(self, source_id: str, db: Session | None = None) -> Source | None:
        if db is not None:
            row = db.get(DataSource, source_id)
            return _source_from_row(row) if row else None
        source = runtime_store.sources.get(source_id)
        return self._attach_connection(source, db) if source else None

    def _save_source(self, source: Source, db: Session | None = None) -> Source:
        if db is not None:
            row = db.get(DataSource, source.id)
            if row is None:
                row = DataSource(id=source.id)
                db.add(row)
            _apply_source_row(row, source)
        else:
            runtime_store.sources[source.id] = source
        return self._attach_connection(source, db)

    def patch_source(self, source_id: str, payload: SourcePatchRequest, db: Session | None = None) -> Source | None:
        source = self.get_source(source_id, db=db)
        if not source:
            return None
        data = source.model_dump(by_alias=True)
        data.update(payload.model_dump(exclude_unset=True, by_alias=True))
        return self._save_source(Source.model_validate(data), db=db)

    def _mark_connection(
        self,
        connection_id: str,
        status: str,
        *,
        error_message: str | None = None,
        connected_at=None,
        db: Session | None = None,
    ) -> None:
        """Write authorization state. `error_message` is always overwritten so a
        successful call clears a stale failure."""
        if db is not None:
            row = db.get(IntegrationConnection, connection_id)
            if row is None:
                return
            row.status = status
            row.error_message = error_message
            if connected_at is not None:
                row.connected_at = connected_at
        else:
            record = runtime_store.connections.get(connection_id)
            if record is None:
                return
            record["status"] = status
            record["error_message"] = error_message
            if connected_at is not None:
                record["connected_at"] = connected_at

    def _catalog_key_for(self, source: Source, db: Session | None = None) -> str | None:
        if source.connection_id:
            if db is not None:
                row = db.get(IntegrationConnection, source.connection_id)
                if row:
                    return row.catalog_key
            else:
                record = runtime_store.connections.get(source.connection_id)
                if record:
                    return record.get("catalog_key")
        return SOURCE_CATALOG_KEYS.get(source.id)

    def _auth_type_for(self, source: Source, db: Session | None = None) -> str | None:
        catalog_key = self._catalog_key_for(source, db=db)
        item = self.get_catalog_item(catalog_key, db=db) if catalog_key else None
        return item.auth_type if item else None

    async def _revoke_upstream(self, connection_id: str) -> str | None:
        """Drop the provider grant and the tool registry entry.

        Returns a message describing what failed, or None. The two calls are
        independent: a provider that rejects the revoke must not leave MCP tools
        registered and callable by agents.
        """
        failures: list[str] = []
        try:
            await auth_connector.revoke(connection_id)
        except Exception as exc:
            logger.exception("Provider revoke failed for connection %s", connection_id)
            failures.append(f"Provider revoke failed: {exc}")
        try:
            await mcp_service.unregister(connection_id)
        except Exception as exc:
            logger.exception("Tool registry cleanup failed for connection %s", connection_id)
            failures.append(f"Tool registry cleanup failed: {exc}")
        return " ".join(failures) or None

    async def disconnect_source(self, source_id: str, db: Session | None = None) -> Source | None:
        source = self.patch_source(
            source_id,
            SourcePatchRequest(aiEnabled=False, status="Revoked", statusType="revoked"),
            db=db,
        )
        if not source:
            return None
        source.last_sync = "Access stopped"
        source.used_by = "Future AI use is blocked"

        # Local access is blocked either way — that is the user's instruction and
        # we control it. An upstream failure is reported, never treated as success.
        failure = await self._revoke_upstream(source.connection_id) if source.connection_id else None
        if source.connection_id:
            self._mark_connection(source.connection_id, "revoked", error_message=failure, db=db)

        activity_service.record(
            f"{source.name} revoked",
            "Access blocked here, but the provider could not confirm it"
            if failure
            else "Future AI use of this source is blocked",
            route="import-data",
            db=db,
        )
        return self._save_source(source, db=db)

    def _reconnect_response(self, source: Source, **extra) -> SourceReconnectResponse:
        return SourceReconnectResponse.model_validate({**source.model_dump(by_alias=True), **extra})

    async def _start_reauthorization(
        self,
        source: Source,
        user_id: str,
        redirect_uri: str | None,
        db: Session | None = None,
    ) -> SourceReconnectResponse:
        catalog_key = self._catalog_key_for(source, db=db)
        started = await self.start_connect(
            ConnectStartRequest(integrationId=catalog_key, redirectUri=redirect_uri),
            user_id,
            db=db,
        )
        pending = self.patch_source(
            source.id,
            SourcePatchRequest(
                aiEnabled=False,
                status="Reauthorization required",
                statusType="attention",
            ),
            db=db,
        )
        pending.last_sync = "Waiting for re-authorization"
        pending.used_by = "Blocked until access is granted again"
        activity_service.record(
            f"{source.name} needs re-authorization",
            "Revoking removed the provider grant, so access must be granted again",
            route="import-data",
            db=db,
        )
        return self._reconnect_response(
            self._save_source(pending, db=db),
            authorizationUrl=started.authorization_url,
            state=started.state,
            reauthorizationRequired=True,
        )

    async def reconnect_source(
        self,
        source_id: str,
        user_id: str = ADMIN_USER_ID,
        redirect_uri: str | None = None,
        db: Session | None = None,
    ) -> SourceReconnectResponse | None:
        source = self.get_source(source_id, db=db)
        if not source:
            return None

        connection = source.connection
        if connection and connection.status == "revoked":
            if self._auth_type_for(source, db=db) in REAUTH_AUTH_TYPES:
                return await self._start_reauthorization(source, user_id, redirect_uri, db=db)

        if connection:
            failure = await self._refresh_upstream(connection.id)
            if failure:
                return self._reconnect_response(
                    self._fail_reconnect(source, connection.id, failure, db=db)
                )
            self._mark_connection(
                connection.id,
                "connected",
                error_message=None,
                connected_at=utcnow(),
                db=db,
            )

        source = self.patch_source(
            source_id,
            SourcePatchRequest(aiEnabled=True, status="Connected", statusType="connected"),
            db=db,
        )
        source.last_sync = "Reconnected now"
        source.used_by = "Available for future authorized AI tasks"
        activity_service.record(
            f"{source.name} reconnected",
            "Source is available for authorized AI tasks",
            route="import-data",
            db=db,
        )
        return self._reconnect_response(self._save_source(source, db=db))

    async def _refresh_upstream(self, connection_id: str) -> str | None:
        """Re-validate a grant that is still live. Returns a failure message."""
        try:
            await auth_connector.refresh(connection_id)
        except Exception as exc:
            logger.exception("Token refresh failed for connection %s", connection_id)
            return f"Could not refresh access with the provider: {exc}"
        return None

    def _fail_reconnect(
        self,
        source: Source,
        connection_id: str,
        failure: str,
        db: Session | None = None,
    ) -> Source:
        self._mark_connection(connection_id, "error", error_message=failure, db=db)
        blocked = self.patch_source(
            source.id,
            SourcePatchRequest(aiEnabled=False, status="Needs attention", statusType="attention"),
            db=db,
        )
        blocked.last_sync = "Reconnect failed"
        blocked.used_by = "Blocked until the connection is restored"
        activity_service.record(f"{source.name} reconnect failed", failure, route="import-data", db=db)
        return self._save_source(blocked, db=db)

    def integration_catalog(
        self,
        q: str | None = None,
        category: str | None = None,
        db: Session | None = None,
    ) -> IntegrationCatalogResponse:
        query_text = (q or "").strip().lower()
        category_slug = (category or "").strip().lower()
        if category_slug in {"", "all"}:
            category_slug = ""

        if db is not None:
            query = db.query(IntegrationCatalog).filter(IntegrationCatalog.enabled.is_(True))
            if category_slug:
                query = query.filter(IntegrationCatalog.category == category_slug)
            if query_text:
                like = f"%{query_text}%"
                query = query.filter(
                    or_(
                        IntegrationCatalog.name.ilike(like),
                        IntegrationCatalog.description.ilike(like),
                        IntegrationCatalog.key.ilike(like),
                    )
                )
            items = [_catalog_from_row(row) for row in query.order_by(IntegrationCatalog.name).all()]
        else:
            items = list(runtime_store.catalog)
            if category_slug:
                items = [item for item in items if item.category == category_slug]
            if query_text:
                items = [
                    item
                    for item in items
                    if query_text in item.name.lower()
                    or query_text in (item.description or "").lower()
                    or query_text in item.id.lower()
                ]
        return IntegrationCatalogResponse(items=items, total=len(items))

    def get_catalog_item(self, key: str, db: Session | None = None) -> IntegrationCatalogItem | None:
        if db is not None:
            row = db.get(IntegrationCatalog, key)
            return _catalog_from_row(row) if row else None
        return runtime_store.catalog_item(key)

    def _store_oauth_state(
        self,
        state: str,
        user_id: str,
        catalog_key: str,
        redirect_uri: str | None,
        db: Session | None = None,
    ) -> None:
        record = {
            "user_id": user_id,
            "catalog_key": catalog_key,
            "redirect_uri": redirect_uri,
            "expires_at": expires_in(15),
        }
        if db is not None:
            db.merge(
                OAuthState(
                    state=state,
                    user_id=user_id,
                    catalog_key=catalog_key,
                    redirect_uri=redirect_uri,
                    expires_at=record["expires_at"],
                )
            )
        else:
            runtime_store.oauth_states[state] = record

    def pop_oauth_state(self, state: str, db: Session | None = None) -> dict | None:
        if db is not None:
            row = db.get(OAuthState, state)
            if not row:
                return None
            if row.expires_at and row.expires_at < utcnow():
                db.delete(row)
                return None
            payload = {
                "user_id": row.user_id,
                "catalog_key": row.catalog_key,
                "redirect_uri": row.redirect_uri,
            }
            db.delete(row)
            return payload
        record = runtime_store.oauth_states.pop(state, None)
        if not record:
            return None
        if record["expires_at"] < utcnow():
            return None
        return record

    async def start_connect(
        self,
        payload: ConnectStartRequest,
        user_id: str,
        db: Session | None = None,
    ) -> ConnectStartResponse:
        item = self.get_catalog_item(payload.integration_id, db=db)
        if not item:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found")

        state = f"st-{uuid4().hex}"
        self._store_oauth_state(state, user_id, item.id, payload.redirect_uri, db=db)

        if item.auth_type == "astrbot":
            return await messaging_service.connect_platform(item.id, payload.redirect_uri, user_id, state)
        if item.auth_type in {"api_key", "mcp_url"}:
            await self.complete_connection(item.id, user_id, state, provider=item.auth_type, db=db)
            return ConnectStartResponse(
                authorizationUrl=payload.redirect_uri or "/",
                state=state,
            )
        # Nango Connect sessions must use the provider config key (e.g. google-calendar).
        integration_key = item.nango_provider_key or item.id
        return await auth_connector.start_authorization(
            integration_key, payload.redirect_uri, user_id, state
        )

    async def complete_connection(
        self,
        catalog_key: str,
        user_id: str,
        state: str,
        *,
        provider: str = "nango",
        external_connection_id: str | None = None,
        db: Session | None = None,
    ) -> Source:
        item = self.get_catalog_item(catalog_key, db=db)
        if not item:
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Catalog item not found")

        connection_id = f"conn-{uuid4().hex[:12]}"
        source_id = CATALOG_SOURCE_IDS.get(catalog_key, catalog_key)
        connection = {
            "id": connection_id,
            "catalog_key": catalog_key,
            "auth_provider": provider if provider != "mcp_url" else "manual",
            "external_connection_id": external_connection_id or f"ext-{state[:12]}",
            "status": "connected",
            "connected_at": utcnow(),
        }

        if db is not None:
            db.add(
                IntegrationConnection(
                    id=connection_id,
                    user_id=user_id,
                    catalog_key=catalog_key,
                    auth_provider=connection["auth_provider"],
                    external_connection_id=connection["external_connection_id"],
                    status="connected",
                    connected_at=utcnow(),
                )
            )
            # The source below points at this connection, so it has to land first.
            db.flush()
        else:
            runtime_store.connections[connection_id] = connection

        source = self.get_source(source_id, db=db) or Source(
            id=source_id,
            name=item.name,
            category=item.category,
            type=item.method,
            method=item.method,
            scopes=item.scopes,
            purposes=["Goal support"],
        )
        source.status = "Connected"
        source.status_type = "connected"
        source.ai_enabled = True
        source.last_sync = "Just now"
        source.used_by = "Available for authorized AI tasks"
        source.connection_id = connection_id
        source = self._save_source(source, db=db)

        try:
            await mcp_service.register_connection(connection_id)
        except Exception as exc:
            # Authorization itself succeeded, so the connection stands. Only tool
            # exposure failed, and that is worth showing rather than swallowing.
            logger.exception("Tool registration failed for connection %s", connection_id)
            self._mark_connection(
                connection_id,
                "connected",
                error_message=f"Connected, but tools are unavailable: {exc}",
                db=db,
            )
            source = self._attach_connection(source, db)

        activity_service.record(
            f"{source.name} connected",
            "Source is available in Import Data",
            route="import-data",
            db=db,
        )
        return source


source_service = SourceService()
