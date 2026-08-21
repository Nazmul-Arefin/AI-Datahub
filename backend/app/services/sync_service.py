"""Sync remote integration data into local Postgres.

Nango proxy is used for SaaS OAuth sources (e.g. Notion, Google Calendar).
AstrBot messaging sources verify the platform link — they are not Nango providers.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode
from uuid import uuid4

from sqlalchemy.orm import Session

from app.adapters.astrbot.client import PLATFORM_SPECS, astrbot_client
from app.adapters.feishu.client import feishu_client
from app.adapters.nango.client import nango_client
from app.models.base import utcnow
from app.models.source import DataSource, IntegrationCatalog, IntegrationConnection
from app.models.synced_asset import SyncedAsset
from app.schemas.sources import Source, SourceSyncItem, SourceSyncResponse
from app.services.activity_service import activity_service
from app.services.runtime_store import runtime_store
from app.services.seed_data import SOURCE_CATALOG_KEYS
from app.services.source_service import source_service

logger = logging.getLogger(__name__)

NOTION_VERSION = "2022-06-28"
DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "synced"
MESSAGING_ASTRBOT_KEYS = frozenset(PLATFORM_SPECS.keys()) | {"lark"}


def _notion_title(item: dict) -> str:
    if isinstance(item.get("title"), str) and item["title"].strip():
        return item["title"].strip()
    if isinstance(item.get("name"), str) and item["name"].strip():
        return item["name"].strip()
    props = item.get("properties") or {}
    for value in props.values():
        if not isinstance(value, dict):
            continue
        if value.get("type") == "title":
            parts = value.get("title") or []
            text = "".join(part.get("plain_text", "") for part in parts if isinstance(part, dict))
            if text.strip():
                return text.strip()
    title_parts = item.get("title") or []
    if isinstance(title_parts, list):
        text = "".join(part.get("plain_text", "") for part in title_parts if isinstance(part, dict))
        if text.strip():
            return text.strip()
    return "Untitled"


def _parent_meta(item: dict) -> tuple[str | None, str | None]:
    parent = item.get("parent") or {}
    if not isinstance(parent, dict):
        return None, None
    ptype = parent.get("type")
    if not ptype:
        return None, None
    return str(ptype), str(parent.get(ptype) or parent.get("id") or "") or None


def _plain_excerpt(item: dict, limit: int = 400) -> str:
    """Best-effort text from title / rich text properties (not full block crawl)."""
    if isinstance(item.get("content_text"), str) and item["content_text"].strip():
        return item["content_text"].strip()[:limit]
    chunks: list[str] = []
    title = _notion_title(item)
    if title and title != "Untitled":
        chunks.append(title)
    props = item.get("properties") or {}
    for key, value in props.items():
        if not isinstance(value, dict):
            continue
        vtype = value.get("type")
        if vtype in {"rich_text", "text"}:
            parts = value.get(vtype) or value.get("rich_text") or []
            text = "".join(part.get("plain_text", "") for part in parts if isinstance(part, dict))
            if text.strip():
                chunks.append(f"{key}: {text.strip()}")
        elif vtype == "url" and value.get("url"):
            chunks.append(f"{key}: {value['url']}")
    joined = " · ".join(chunks)
    return joined[:limit]


class SyncService:
    def __init__(self, client=nango_client, messaging_client=astrbot_client) -> None:
        self._client = client
        self._messaging = messaging_client

    def _catalog_key(self, source: Source, db: Session | None) -> str:
        mapped = SOURCE_CATALOG_KEYS.get(source.id)
        if mapped:
            return mapped
        if db is not None and source.connection_id:
            row = db.get(IntegrationConnection, source.connection_id)
            if row:
                return row.catalog_key
        return source.id

    def _provider_key(self, catalog_key: str, db: Session | None) -> str:
        if db is not None:
            row = db.get(IntegrationCatalog, catalog_key)
            if row and row.nango_provider_key:
                return row.nango_provider_key
        return catalog_key

    def _catalog_auth_type(self, catalog_key: str, db: Session | None) -> str | None:
        if db is not None:
            row = db.get(IntegrationCatalog, catalog_key)
            if row and row.auth_type:
                return str(row.auth_type)
        item = source_service.get_catalog_item(catalog_key, db=db)
        return item.auth_type if item else None

    def _is_astrbot_source(self, source: Source, catalog_key: str, db: Session | None) -> bool:
        provider = (source.connection.auth_provider if source.connection else "") or ""
        if provider.lower() == "astrbot":
            return True
        auth_type = self._catalog_auth_type(catalog_key, db) or ""
        if auth_type.lower() == "astrbot":
            return True
        return catalog_key in MESSAGING_ASTRBOT_KEYS or source.id in MESSAGING_ASTRBOT_KEYS

    async def _fetch_notion_objects(self, connection_id: str, provider_key: str) -> list[dict]:
        results: list[dict] = []
        cursor: str | None = None
        while True:
            body: dict = {"page_size": 100}
            if cursor:
                body["start_cursor"] = cursor
            payload = await self._client.proxy(
                "POST",
                "/v1/search",
                connection_id=connection_id,
                provider_config_key=provider_key,
                json_body=body,
                extra_headers={"nango-proxy-Notion-Version": NOTION_VERSION},
            )
            batch = payload.get("results") or []
            results.extend(item for item in batch if isinstance(item, dict))
            if not payload.get("has_more"):
                break
            cursor = payload.get("next_cursor")
            if not cursor:
                break
            if len(results) >= 500:
                break
        return results

    def _mock_notion_objects(self, source_id: str) -> list[dict]:
        return [
            {
                "object": "page",
                "id": f"mock-page-{source_id}-1",
                "url": "https://www.notion.so/mock-page-1",
                "last_edited_time": utcnow().isoformat(),
                "parent": {"type": "workspace", "workspace": True},
                "properties": {
                    "title": {
                        "type": "title",
                        "title": [{"type": "text", "plain_text": "Mock Notion Page"}],
                    }
                },
            },
            {
                "object": "page",
                "id": f"mock-page-{source_id}-2",
                "url": "https://www.notion.so/mock-page-2",
                "last_edited_time": utcnow().isoformat(),
                "parent": {"type": "workspace", "workspace": True},
                "properties": {
                    "title": {
                        "type": "title",
                        "title": [{"type": "text", "plain_text": "Project Notes"}],
                    }
                },
            },
        ]

    def _mock_google_calendar_events(self, source_id: str) -> list[dict]:
        now = datetime.now(timezone.utc)
        return [
            {
                "id": f"mock-event-{source_id}-1",
                "object": "calendar_event",
                "title": "Team standup",
                "url": "https://calendar.google.com/",
                "last_edited_time": now.isoformat(),
                "content_text": f"{now.isoformat()} → {(now + timedelta(hours=1)).isoformat()} · Mock event",
                "parent": {"type": "calendar", "calendar": "primary"},
            },
            {
                "id": f"mock-event-{source_id}-2",
                "object": "calendar_event",
                "title": "Focus block",
                "url": "https://calendar.google.com/",
                "last_edited_time": now.isoformat(),
                "content_text": f"{(now + timedelta(days=1)).isoformat()} → {(now + timedelta(days=1, hours=2)).isoformat()}",
                "parent": {"type": "calendar", "calendar": "primary"},
            },
        ]

    async def _list_google_calendars(self, connection_id: str, provider_key: str) -> list[dict]:
        """Return calendars from the user's calendarList (selected ones preferred)."""
        payload = await self._client.proxy(
            "GET",
            "/calendar/v3/users/me/calendarList",
            connection_id=connection_id,
            provider_config_key=provider_key,
        )
        calendars: list[dict] = []
        for item in payload.get("items") or []:
            if not isinstance(item, dict):
                continue
            cal_id = str(item.get("id") or "").strip()
            if not cal_id:
                continue
            # Skip calendars the user unchecked in Google Calendar UI.
            if item.get("selected") is False:
                continue
            calendars.append(
                {
                    "id": cal_id,
                    "summary": str(item.get("summary") or cal_id).strip() or cal_id,
                    "primary": bool(item.get("primary")),
                }
            )
        if not calendars:
            calendars.append({"id": "primary", "summary": "primary", "primary": True})
        return calendars

    async def _fetch_google_calendar_events(self, connection_id: str, provider_key: str) -> list[dict]:
        """Pull events from every selected calendar via Nango → Google Calendar API."""
        from urllib.parse import quote

        now = datetime.now(timezone.utc)
        time_min = (now - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
        time_max = (now + timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%SZ")
        results: list[dict] = []
        seen: set[str] = set()

        calendars = await self._list_google_calendars(connection_id, provider_key)
        for calendar in calendars:
            cal_id = calendar["id"]
            cal_name = calendar["summary"]
            page_token: str | None = None
            while True:
                params: dict[str, str] = {
                    "maxResults": "100",
                    "singleEvents": "true",
                    "orderBy": "startTime",
                    "timeMin": time_min,
                    "timeMax": time_max,
                }
                if page_token:
                    params["pageToken"] = page_token
                # Calendar ids can contain # / @ — must be path-encoded.
                encoded_cal = quote(cal_id, safe="")
                path = f"/calendar/v3/calendars/{encoded_cal}/events?{urlencode(params)}"
                payload = await self._client.proxy(
                    "GET",
                    path,
                    connection_id=connection_id,
                    provider_config_key=provider_key,
                )
                for item in payload.get("items") or []:
                    if not isinstance(item, dict):
                        continue
                    event_id = str(item.get("id") or "").strip()
                    if not event_id:
                        continue
                    # Prefix with calendar so the same event id on two calendars stays unique.
                    external_id = f"{cal_id}:{event_id}"
                    if external_id in seen:
                        continue
                    seen.add(external_id)
                    start = item.get("start") if isinstance(item.get("start"), dict) else {}
                    end = item.get("end") if isinstance(item.get("end"), dict) else {}
                    start_s = str(start.get("dateTime") or start.get("date") or "")
                    end_s = str(end.get("dateTime") or end.get("date") or "")
                    summary = str(item.get("summary") or "").strip() or "(No title)"
                    description = str(item.get("description") or "").strip()
                    content = f"[{cal_name}] {start_s} → {end_s}".strip()
                    if description:
                        content = f"{content} · {description}"
                    results.append(
                        {
                            "id": external_id,
                            "object": "calendar_event",
                            "title": summary if calendar.get("primary") else f"{summary} · {cal_name}",
                            "url": item.get("htmlLink"),
                            "last_edited_time": item.get("updated"),
                            "content_text": content[:400],
                            "parent": {"type": "calendar", "calendar": cal_id},
                        }
                    )
                page_token = payload.get("nextPageToken")
                if not page_token or len(results) >= 500:
                    break
            if len(results) >= 500:
                break
        return results

    def _is_google_calendar_provider(self, provider_key: str) -> bool:
        key = (provider_key or "").lower().replace("_", "-")
        return key in {"google-calendar", "googlecalendar"}

    async def _fetch_astrbot_platform_status(self, catalog_key: str) -> list[dict]:
        """Confirm messaging adapter; for Feishu also pull chats/messages via Open API."""
        key = catalog_key.lower().replace("_", "-")
        if key == "lark":
            key = "feishu"
        spec = PLATFORM_SPECS.get(key) or {}
        astrbot_type = str(spec.get("astrbot_type") or key)
        display = str(spec.get("name") or catalog_key)
        setup = f"{getattr(self._messaging, 'public_url', '').rstrip('/')}/#/platforms"

        # Feishu: real read path (chats + recent messages + calendar if scoped).
        if key == "feishu":
            creds = await feishu_client.resolve_credentials(self._messaging)
            if not creds:
                raise RuntimeError(
                    f"{display} is connected in Weeple, but Feishu app credentials were not found. "
                    "Enable the lark adapter in AstrBot Platforms (or set FEISHU_APP_ID/SECRET)."
                )
            try:
                chats = await feishu_client.list_chats(creds)
            except Exception as exc:
                raise RuntimeError(f"Feishu chat list failed: {exc}") from exc
            messages_by_chat: dict[str, list] = {}
            for chat in chats[:15]:
                chat_id = str(chat.get("chat_id") or "")
                if not chat_id:
                    continue
                try:
                    messages_by_chat[chat_id] = await feishu_client.list_messages(creds, chat_id, page_size=15)
                except Exception as exc:
                    logger.info("Skip messages for chat %s: %s", chat_id, exc)
                    messages_by_chat[chat_id] = []
            events = await feishu_client.list_calendar_events(creds, limit=20)
            files = await feishu_client.list_drive_files(creds, limit=30)
            calendars = await feishu_client.list_calendars(creds)
            capabilities = await feishu_client.probe_capabilities(creds)
            return feishu_client.messages_to_sync_items(
                chats=chats,
                messages_by_chat=messages_by_chat,
                events=events,
                files=files,
                calendars=calendars,
                capabilities=capabilities,
                adapter_id=str(creds.get("adapter_id") or "lark"),
            )

        bots = await self._messaging.list_remote_bots()
        matches = [
            bot
            for bot in bots
            if str(bot.get("type") or "") == astrbot_type and bot.get("enable")
        ]
        if not matches:
            matches = [
                bot
                for bot in bots
                if bot.get("enable") and astrbot_type in str(bot.get("type") or "")
            ]

        if not matches:
            raise RuntimeError(
                f"{display} is authorized in Weeple, but no enabled AstrBot adapter "
                f"of type '{astrbot_type}' was found. Open Platforms and enable it, then Sync again."
            )

        now = utcnow().isoformat()
        remote: list[dict] = []
        for bot in matches:
            bot_id = str(bot.get("id") or f"{astrbot_type}-adapter")
            remote.append(
                {
                    "id": bot_id,
                    "object": "platform",
                    "title": f"{display} · {bot_id}",
                    "url": setup,
                    "last_edited_time": now,
                    "content_text": (
                        f"Messaging adapter connected via AstrBot ({astrbot_type}). "
                        "Inbound chat is handled by AstrBot; Sync verifies the platform link."
                    ),
                    "parent": {"type": "astrbot", "astrbot": astrbot_type},
                }
            )
        return remote

    def _upsert_assets(
        self,
        *,
        source_id: str,
        connection_id: str | None,
        provider: str,
        remote_items: list[dict],
        db: Session | None,
    ) -> tuple[list[SourceSyncItem], int, int]:
        now = utcnow()
        created = 0
        updated = 0
        items: list[SourceSyncItem] = []
        seen_external: set[str] = set()

        for remote in remote_items:
            external_id = str(remote.get("id") or "")
            if not external_id or external_id in seen_external:
                continue
            seen_external.add(external_id)
            object_type = str(remote.get("object") or "page")
            title = _notion_title(remote)
            parent_type, parent_id = _parent_meta(remote)
            url = remote.get("url")
            last_edited = remote.get("last_edited_time")
            excerpt = _plain_excerpt(remote)
            slim_raw = {
                "id": external_id,
                "object": object_type,
                "url": url,
                "last_edited_time": last_edited,
                "parent": remote.get("parent"),
            }

            if db is not None:
                row = (
                    db.query(SyncedAsset)
                    .filter(SyncedAsset.source_id == source_id, SyncedAsset.external_id == external_id)
                    .one_or_none()
                )
                if row is None:
                    row = SyncedAsset(
                        id=f"asset-{uuid4().hex[:12]}",
                        source_id=source_id,
                        connection_id=connection_id,
                        provider=provider,
                        external_id=external_id,
                    )
                    db.add(row)
                    created += 1
                else:
                    updated += 1
                row.connection_id = connection_id
                row.provider = provider
                row.object_type = object_type
                row.title = title
                row.url = url
                row.parent_type = parent_type
                row.parent_id = parent_id
                row.last_edited_at = str(last_edited) if last_edited else None
                row.content_text = excerpt
                row.raw_json = slim_raw
                row.synced_at = now
                items.append(
                    SourceSyncItem(
                        id=row.id,
                        externalId=external_id,
                        objectType=object_type,
                        title=title,
                        url=url,
                        lastEditedAt=str(last_edited) if last_edited else None,
                        syncedAt=now,
                    )
                )
            else:
                asset_id = f"asset-{uuid4().hex[:12]}"
                source_bucket = runtime_store.synced_assets.setdefault(source_id, {})
                is_new = external_id not in source_bucket
                source_bucket[external_id] = {
                    "id": asset_id if is_new else source_bucket[external_id]["id"],
                    "source_id": source_id,
                    "connection_id": connection_id,
                    "provider": provider,
                    "external_id": external_id,
                    "object_type": object_type,
                    "title": title,
                    "url": url,
                    "parent_type": parent_type,
                    "parent_id": parent_id,
                    "last_edited_at": str(last_edited) if last_edited else None,
                    "content_text": excerpt,
                    "raw_json": slim_raw,
                    "synced_at": now.isoformat(),
                }
                if is_new:
                    created += 1
                else:
                    updated += 1
                    asset_id = source_bucket[external_id]["id"]
                items.append(
                    SourceSyncItem(
                        id=asset_id,
                        externalId=external_id,
                        objectType=object_type,
                        title=title,
                        url=url,
                        lastEditedAt=str(last_edited) if last_edited else None,
                        syncedAt=now,
                    )
                )

        return items, created, updated

    def _write_snapshot(self, source_id: str, provider: str, items: list[SourceSyncItem]) -> str | None:
        try:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            path = DATA_DIR / f"{provider}-{source_id}-latest.json"
            payload = {
                "sourceId": source_id,
                "provider": provider,
                "syncedAt": utcnow().isoformat(),
                "count": len(items),
                "items": [item.model_dump(by_alias=True, mode="json") for item in items],
            }
            path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            return str(path)
        except OSError as exc:
            logger.warning("Could not write sync snapshot: %s", exc)
            return None

    def list_assets(self, source_id: str, db: Session | None = None, limit: int = 100) -> list[SourceSyncItem]:
        if db is not None:
            rows = (
                db.query(SyncedAsset)
                .filter(SyncedAsset.source_id == source_id)
                .order_by(SyncedAsset.synced_at.desc(), SyncedAsset.title)
                .limit(limit)
                .all()
            )
            return [
                SourceSyncItem(
                    id=row.id,
                    externalId=row.external_id,
                    objectType=row.object_type,
                    title=row.title,
                    url=row.url,
                    lastEditedAt=row.last_edited_at,
                    syncedAt=row.synced_at,
                )
                for row in rows
            ]
        bucket = runtime_store.synced_assets.get(source_id, {})
        items = list(bucket.values())
        items.sort(key=lambda r: r.get("synced_at") or "", reverse=True)
        out: list[SourceSyncItem] = []
        for row in items[:limit]:
            out.append(
                SourceSyncItem(
                    id=row["id"],
                    externalId=row["external_id"],
                    objectType=row.get("object_type", "page"),
                    title=row.get("title") or "Untitled",
                    url=row.get("url"),
                    lastEditedAt=row.get("last_edited_at"),
                    syncedAt=row.get("synced_at"),
                )
            )
        return out

    def _finalize_sync(
        self,
        *,
        source: Source,
        source_id: str,
        provider_label: str,
        remote_items: list[dict],
        connection_row_id: str | None,
        db: Session | None,
        activity_detail: str,
        storage_extra: str = "",
    ) -> SourceSyncResponse:
        items, created, updated = self._upsert_assets(
            source_id=source_id,
            connection_id=connection_row_id,
            provider=provider_label,
            remote_items=remote_items,
            db=db,
        )
        snapshot = self._write_snapshot(source_id, provider_label.replace("/", "-"), items)

        total = len(items)
        noun = "item" if total == 1 else "items"
        last_sync = "Just now"
        assets_label = f"{total} {noun}"
        if db is not None:
            row = db.get(DataSource, source_id)
            if row:
                row.last_sync = last_sync
                row.assets = assets_label
                row.status = "Connected"
                row.status_type = "connected"
        else:
            source.last_sync = last_sync
            source.assets = assets_label
            source_service._save_source(source, db=None)

        refreshed = source_service.get_source(source_id, db=db) or source
        activity_service.record(
            f"{refreshed.name} synced",
            activity_detail
            or f"Fetched {total} {noun} from {provider_label} ({created} new, {updated} updated)",
            route="import-data",
            db=db,
        )

        storage_hint = "Postgres table synced_assets" + (f" · snapshot {snapshot}" if snapshot else "")
        if storage_extra:
            storage_hint = f"{storage_hint} · {storage_extra}"
        return SourceSyncResponse(
            source=refreshed,
            provider=provider_label,
            fetched=total,
            created=created,
            updated=updated,
            storage=storage_hint,
            items=items,
        )

    async def sync_source(self, source_id: str, db: Session | None = None) -> SourceSyncResponse:
        source = source_service.get_source(source_id, db=db)
        if not source:
            raise LookupError("Source not found")
        if source.status_type == "revoked" or (source.connection and source.connection.status == "revoked"):
            raise PermissionError("Source access is revoked")

        catalog_key = self._catalog_key(source, db)
        connection_row_id = source.connection_id

        # AstrBot messaging: verify platform adapter — never call Nango.
        if self._is_astrbot_source(source, catalog_key, db):
            try:
                remote_items = await self._fetch_astrbot_platform_status(catalog_key)
            except Exception as exc:
                logger.exception("AstrBot sync failed for %s", source_id)
                raise RuntimeError(str(exc)) from exc
            return self._finalize_sync(
                source=source,
                source_id=source_id,
                provider_label="astrbot",
                remote_items=remote_items,
                connection_row_id=connection_row_id,
                db=db,
                activity_detail=f"Synced AstrBot/Feishu data for {catalog_key}",
                storage_extra=(
                    "Feishu Open API chats/messages"
                    if catalog_key in {"feishu", "lark"}
                    else "messaging link check (not Nango doc sync)"
                ),
            )

        provider_key = self._provider_key(catalog_key, db)
        stored_ext = source.connection.external_connection_id if source.connection else None

        resolved = await self._client.resolve_connection_id(stored_ext, provider_key)
        if resolved and db is not None and connection_row_id and resolved != stored_ext:
            conn_row = db.get(IntegrationConnection, connection_row_id)
            if conn_row:
                conn_row.external_connection_id = resolved
                stored_ext = resolved

        live = self._client.mode == "live" and bool(self._client.secret_key) and bool(resolved)
        is_gcal = self._is_google_calendar_provider(provider_key) or catalog_key in {
            "google-calendar",
            "calendar",
        }
        if live:
            try:
                if is_gcal:
                    remote_items = await self._fetch_google_calendar_events(resolved, provider_key)
                else:
                    remote_items = await self._fetch_notion_objects(resolved, provider_key)
            except Exception as exc:
                label = "Google Calendar" if is_gcal else "Notion"
                logger.exception("%s sync failed for %s", label, source_id)
                raise RuntimeError(str(exc)) from exc
        else:
            remote_items = (
                self._mock_google_calendar_events(source_id)
                if is_gcal
                else self._mock_notion_objects(source_id)
            )

        return self._finalize_sync(
            source=source,
            source_id=source_id,
            provider_label=provider_key,
            remote_items=remote_items,
            connection_row_id=connection_row_id,
            db=db,
            activity_detail="Synced Google Calendar events" if is_gcal else "",
            storage_extra="Google Calendar events via Nango" if is_gcal else "",
        )


sync_service = SyncService()
