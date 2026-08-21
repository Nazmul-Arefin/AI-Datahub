"""Feishu / Lark Open API — tenant token, chats, messages, send.

Credentials come from AstrBot platform config or env. Never return secrets.
"""

from __future__ import annotations

import json
import logging
from typing import Any
from uuid import uuid4

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class FeishuClient:
    def __init__(self) -> None:
        self._token_cache: dict[str, tuple[str, float]] = {}

    async def resolve_credentials(self, astrbot_client: Any | None = None) -> dict[str, str] | None:
        """Prefer AstrBot lark adapter creds; fall back to FEISHU_* env."""
        if astrbot_client is not None:
            getter = getattr(astrbot_client, "get_lark_credentials", None)
            if callable(getter):
                creds = await getter()
                if creds and creds.get("app_id") and creds.get("app_secret"):
                    return creds
        app_id = (getattr(settings, "feishu_app_id", "") or "").strip()
        app_secret = (getattr(settings, "feishu_app_secret", "") or "").strip()
        if app_id and app_secret:
            return {
                "app_id": app_id,
                "app_secret": app_secret,
                "domain": (getattr(settings, "feishu_domain", None) or "https://open.feishu.cn").rstrip("/"),
                "adapter_id": "env",
            }
        return None

    async def _tenant_token(self, creds: dict[str, str]) -> str:
        domain = creds["domain"].rstrip("/")
        cache_key = creds["app_id"]
        import time

        cached = self._token_cache.get(cache_key)
        if cached and cached[1] > time.time() + 60:
            return cached[0]

        url = f"{domain}/open-apis/auth/v3/tenant_access_token/internal"
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                url,
                json={"app_id": creds["app_id"], "app_secret": creds["app_secret"]},
            )
        data = response.json() if response.content else {}
        if response.status_code >= 400 or int(data.get("code", 0) or 0) != 0:
            raise RuntimeError(f"Feishu token error: {data.get('msg') or data.get('message') or response.status_code}")
        token = data.get("tenant_access_token")
        if not token:
            raise RuntimeError("Feishu token missing in response")
        expire = float(data.get("expire") or 7200)
        import time as _time

        self._token_cache[cache_key] = (token, _time.time() + expire)
        return token

    async def _api_get(self, creds: dict[str, str], path: str, params: dict | None = None) -> dict:
        token = await self._tenant_token(creds)
        domain = creds["domain"].rstrip("/")
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.get(
                f"{domain}{path}",
                headers={"Authorization": f"Bearer {token}"},
                params=params or None,
            )
        data = response.json() if response.content else {}
        if response.status_code >= 400 or data.get("code", 0) != 0:
            raise RuntimeError(f"Feishu GET {path}: {data.get('msg') or response.status_code}")
        return data.get("data") or {}

    async def _api_post(self, creds: dict[str, str], path: str, body: dict) -> dict:
        token = await self._tenant_token(creds)
        domain = creds["domain"].rstrip("/")
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(
                f"{domain}{path}",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=body,
            )
        data = response.json() if response.content else {}
        if response.status_code >= 400 or data.get("code", 0) != 0:
            raise RuntimeError(f"Feishu POST {path}: {data.get('msg') or response.status_code}")
        return data.get("data") or {}

    async def list_chats(self, creds: dict[str, str], *, page_size: int = 50) -> list[dict[str, Any]]:
        data = await self._api_get(creds, "/open-apis/im/v1/chats", {"page_size": page_size})
        items = data.get("items") or []
        return [item for item in items if isinstance(item, dict)]

    async def list_messages(
        self,
        creds: dict[str, str],
        chat_id: str,
        *,
        page_size: int = 20,
    ) -> list[dict[str, Any]]:
        data = await self._api_get(
            creds,
            "/open-apis/im/v1/messages",
            {
                "container_id_type": "chat",
                "container_id": chat_id,
                "page_size": page_size,
                "sort_type": "ByCreateTimeDesc",
            },
        )
        items = data.get("items") or []
        return [item for item in items if isinstance(item, dict)]

    async def send_text(self, creds: dict[str, str], chat_id: str, text: str) -> dict[str, Any]:
        data = await self._api_post(
            creds,
            "/open-apis/im/v1/messages?receive_id_type=chat_id",
            {
                "receive_id": chat_id,
                "msg_type": "text",
                "content": json.dumps({"text": text[:4000]}, ensure_ascii=False),
            },
        )
        message_id = data.get("message_id") or f"fs-{uuid4().hex[:8]}"
        return {"message_id": message_id, "chat_id": chat_id}

    async def list_calendar_events(self, creds: dict[str, str], *, limit: int = 20) -> list[dict[str, Any]]:
        """Best-effort; returns [] if calendar scope is not granted or no events on bot calendars."""
        import time

        try:
            calendars = await self._api_get(creds, "/open-apis/calendar/v4/calendars", {"page_size": 50})
        except RuntimeError as exc:
            logger.info("Feishu calendars unavailable: %s", exc)
            return []
        events: list[dict[str, Any]] = []
        now = int(time.time())
        # Feishu often returns nothing without an explicit window.
        params_base = {
            "page_size": min(limit, 50),
            "start_time": str(now - 86400 * 90),
            "end_time": str(now + 86400 * 180),
        }
        for cal in calendars.get("calendar_list") or calendars.get("calendars") or []:
            if not isinstance(cal, dict):
                continue
            cal_id = cal.get("calendar_id") or cal.get("id")
            if not cal_id:
                continue
            try:
                data = await self._api_get(
                    creds,
                    f"/open-apis/calendar/v4/calendars/{cal_id}/events",
                    params_base,
                )
            except RuntimeError:
                continue
            for ev in data.get("items") or []:
                if isinstance(ev, dict):
                    # Keep calendar summary for titles.
                    ev.setdefault("_calendar_summary", cal.get("summary") or cal_id)
                    events.append(ev)
            if len(events) >= limit:
                break
        return events[:limit]

    async def list_calendars(self, creds: dict[str, str]) -> list[dict[str, Any]]:
        try:
            data = await self._api_get(creds, "/open-apis/calendar/v4/calendars", {"page_size": 50})
        except RuntimeError:
            return []
        return [c for c in (data.get("calendar_list") or data.get("calendars") or []) if isinstance(c, dict)]

    async def probe_capabilities(self, creds: dict[str, str]) -> list[dict[str, Any]]:
        """Return sync status rows for calendar/docs so Sync UI explains gaps (no silent empty)."""
        from app.models.base import utcnow

        now = utcnow().isoformat()
        rows: list[dict[str, Any]] = []
        app_id = creds.get("app_id") or ""
        cal_url = (
            f"https://open.feishu.cn/app/{app_id}/auth?"
            "q=calendar:calendar:readonly,calendar:calendar&op_from=openapi&token_type=tenant"
            if app_id
            else "https://open.feishu.cn/app"
        )
        drive_url = (
            f"https://open.feishu.cn/app/{app_id}/auth?"
            "q=drive:drive:readonly,drive:drive,space:document:retrieve&op_from=openapi&token_type=tenant"
            if app_id
            else "https://open.feishu.cn/app"
        )

        # Calendar
        try:
            await self._api_get(creds, "/open-apis/calendar/v4/calendars", {"page_size": 50})
            rows.append(
                {
                    "id": "capability:calendar:ok",
                    "object": "capability",
                    "title": "Calendar API reachable",
                    "url": None,
                    "last_edited_time": now,
                    "content_text": "calendar scopes granted",
                    "parent": {"type": "capability", "capability": "calendar"},
                }
            )
        except RuntimeError as exc:
            rows.append(
                {
                    "id": "capability:calendar:missing",
                    "object": "capability",
                    "title": "Calendar not synced — missing app scope",
                    "url": cal_url,
                    "last_edited_time": now,
                    "content_text": (
                        "Open Feishu app Permissions, enable calendar:calendar:readonly, "
                        "publish/approve, then Sync again. "
                        f"Apply: {cal_url}"
                    )[:400],
                    "parent": {"type": "capability", "capability": "calendar"},
                }
            )
            logger.info("Feishu calendar probe failed: %s", exc)

        # Docs / Drive listing
        try:
            root = await self._api_get(creds, "/open-apis/drive/explorer/v2/root_folder/meta")
            folder = root.get("token")
            if folder:
                await self._api_get(
                    creds,
                    "/open-apis/drive/v1/files",
                    {"folder_token": folder, "page_size": 10},
                )
            rows.append(
                {
                    "id": "capability:docs:ok",
                    "object": "capability",
                    "title": "Docs/Drive API reachable",
                    "url": None,
                    "last_edited_time": now,
                    "content_text": "drive scopes granted",
                    "parent": {"type": "capability", "capability": "docs"},
                }
            )
        except RuntimeError as exc:
            rows.append(
                {
                    "id": "capability:docs:missing",
                    "object": "capability",
                    "title": "Docs not synced — missing drive scope",
                    "url": drive_url,
                    "last_edited_time": now,
                    "content_text": (
                        "Open Feishu app Permissions, enable drive:drive:readonly, "
                        "publish/approve, then Sync again. "
                        f"Apply: {drive_url}"
                    )[:400],
                    "parent": {"type": "capability", "capability": "docs"},
                }
            )
            logger.info("Feishu docs probe failed: %s", exc)

        return rows

    async def list_drive_files(self, creds: dict[str, str], *, limit: int = 30) -> list[dict[str, Any]]:
        """List files the bot can access.

        Root folder listing alone misses collaborator-shared docs. Feishu
        `suite/docs-api/search/object` returns shared files (e.g. after Share → bot).
        """
        found: dict[str, dict[str, Any]] = {}

        # 1) Bot cloud root (often empty).
        try:
            root = await self._api_get(creds, "/open-apis/drive/explorer/v2/root_folder/meta")
            folder = root.get("token")
            if folder:
                data = await self._api_get(
                    creds,
                    "/open-apis/drive/v1/files",
                    {"folder_token": folder, "page_size": min(limit, 50)},
                )
                for f in data.get("files") or []:
                    if not isinstance(f, dict):
                        continue
                    token = str(f.get("token") or f.get("file_token") or "")
                    if token:
                        found[token] = {
                            "token": token,
                            "name": f.get("name") or token,
                            "type": f.get("type") or "file",
                            "url": f.get("url"),
                            "modified_time": f.get("modified_time"),
                        }
        except RuntimeError as exc:
            logger.info("Feishu root file list skipped: %s", exc)

        # 2) Search objects the app/bot can see (includes collaborator shares).
        # Put specific queries first so shared docs like Sobuj_Resume win over template noise.
        search_queries = (
            ("Sobuj", ["file", "docx", "doc", "folder"]),
            ("weeple", ["file", "docx", "doc", "folder"]),
            ("resume", ["file", "docx", "doc"]),
            ("Resume", ["file", "docx", "doc"]),
            ("a", ["file", "docx", "doc", "folder"]),
        )
        for key, types in search_queries:
            if len(found) >= limit:
                break
            try:
                data = await self._api_post(
                    creds,
                    "/open-apis/suite/docs-api/search/object",
                    {
                        "search_key": key,
                        "count": min(50, max(limit, 20)),
                        "offset": 0,
                        "owner_ids": [],
                        "docs_types": types,
                    },
                )
            except RuntimeError as exc:
                logger.info("Feishu docs search skipped (%s): %s", key, exc)
                continue
            for ent in data.get("docs_entities") or []:
                if not isinstance(ent, dict):
                    continue
                token = str(ent.get("docs_token") or "")
                if not token or token in found:
                    continue
                dtype = str(ent.get("docs_type") or "file")
                found[token] = {
                    "token": token,
                    "name": ent.get("title") or token,
                    "type": dtype,
                    "url": None,
                    "modified_time": None,
                    "owner_id": ent.get("owner_id"),
                }

        # 3) Resolve open URLs for a subset (best-effort).
        tokens = list(found.values())[: min(limit, 20)]
        request_docs = []
        for item in tokens:
            dtype = item.get("type") or "file"
            # batch_query doc_type mapping
            mapped = dtype if dtype in {"doc", "docx", "sheet", "bitable", "folder", "file", "slides"} else "file"
            request_docs.append({"doc_token": item["token"], "doc_type": mapped})
        if request_docs:
            try:
                meta = await self._api_post(
                    creds,
                    "/open-apis/drive/v1/metas/batch_query",
                    {"request_docs": request_docs, "with_url": True},
                )
                for m in meta.get("metas") or []:
                    if not isinstance(m, dict):
                        continue
                    t = str(m.get("doc_token") or "")
                    if t in found:
                        found[t]["url"] = m.get("url") or found[t].get("url")
                        if m.get("title"):
                            found[t]["name"] = m["title"]
                        if m.get("latest_modify_time"):
                            found[t]["modified_time"] = m["latest_modify_time"]
            except RuntimeError as exc:
                logger.info("Feishu meta batch skipped: %s", exc)

        return list(found.values())[:limit]

    def messages_to_sync_items(
        self,
        *,
        chats: list[dict],
        messages_by_chat: dict[str, list[dict]],
        events: list[dict],
        files: list[dict] | None = None,
        calendars: list[dict] | None = None,
        capabilities: list[dict] | None = None,
        adapter_id: str,
    ) -> list[dict]:
        """Shape Feishu payloads into SyncService remote item dicts (no secrets)."""
        from app.models.base import utcnow

        now = utcnow().isoformat()
        remote: list[dict] = [
            {
                "id": f"adapter:{adapter_id}",
                "object": "platform",
                "title": f"飞书 Feishu adapter · {adapter_id}",
                "url": None,
                "last_edited_time": now,
                "content_text": (
                    "Bot identity sync. Chats work when the bot is in the group. "
                    "Personal calendar/docs only appear if shared with the app/bot "
                    "(or via Feishu User OAuth)."
                ),
                "parent": {"type": "astrbot", "astrbot": "lark"},
            }
        ]
        for cap in capabilities or []:
            if isinstance(cap, dict) and cap.get("id"):
                remote.append(cap)

        for cal in calendars or []:
            cal_id = str(cal.get("calendar_id") or cal.get("id") or "")
            if not cal_id:
                continue
            summary = str(cal.get("summary") or cal_id)
            remote.append(
                {
                    "id": cal_id,
                    "object": "calendar",
                    "title": f"Calendar · {summary}",
                    "url": None,
                    "last_edited_time": now,
                    "content_text": f"type={cal.get('type')} role={cal.get('role')}",
                    "parent": {"type": "feishu_calendar", "feishu_calendar": cal_id},
                }
            )

        if any(c.get("id") == "capability:calendar:ok" for c in (capabilities or [])) and not events:
            remote.append(
                {
                    "id": "capability:calendar:empty",
                    "object": "capability",
                    "title": "Calendar API OK — no events on bot calendars",
                    "url": None,
                    "last_edited_time": now,
                    "content_text": (
                        "Your personal Feishu event is not visible to the bot calendar. "
                        "Share the calendar with the app, create an event on the bot calendar, "
                        "or use Feishu User OAuth."
                    ),
                    "parent": {"type": "capability", "capability": "calendar"},
                }
            )

        if any(c.get("id") == "capability:docs:ok" for c in (capabilities or [])) and not (files or []):
            remote.append(
                {
                    "id": "capability:docs:empty",
                    "object": "capability",
                    "title": "Docs API OK — bot drive root is empty",
                    "url": None,
                    "last_edited_time": now,
                    "content_text": (
                        "No docs found via search yet. Share the file/folder with the Feishu bot, "
                        "wait a minute, then Sync again. Search uses suite/docs-api (not only bot root)."
                    ),
                    "parent": {"type": "capability", "capability": "docs"},
                }
            )

        for chat in chats:
            chat_id = str(chat.get("chat_id") or "")
            if not chat_id:
                continue
            name = chat.get("name") or chat.get("i18n_names", {}).get("zh_cn") or chat_id
            remote.append(
                {
                    "id": chat_id,
                    "object": "chat",
                    "title": f"Chat · {name}",
                    "url": None,
                    "last_edited_time": now,
                    "content_text": f"Feishu chat_id={chat_id}",
                    "parent": {"type": "feishu_chat", "feishu_chat": chat_id},
                }
            )
            for msg in messages_by_chat.get(chat_id, []):
                mid = str(msg.get("message_id") or msg.get("msg_id") or "")
                if not mid:
                    continue
                body = msg.get("body") or {}
                content_raw = body.get("content") if isinstance(body, dict) else None
                text = ""
                if isinstance(content_raw, str):
                    try:
                        parsed = json.loads(content_raw)
                        text = str(parsed.get("text") or content_raw)[:400]
                    except json.JSONDecodeError:
                        text = content_raw[:400]
                sender = (msg.get("sender") or {}).get("id") if isinstance(msg.get("sender"), dict) else ""
                create_time = msg.get("create_time") or msg.get("updated_at") or now
                remote.append(
                    {
                        "id": mid,
                        "object": "message",
                        "title": (text or f"Message {mid}")[:120],
                        "url": None,
                        "last_edited_time": str(create_time),
                        "content_text": f"{sender}: {text}"[:400] if text else f"sender={sender}",
                        "parent": {"type": "feishu_chat", "feishu_chat": chat_id},
                    }
                )
        for ev in events:
            eid = str(ev.get("event_id") or ev.get("id") or "")
            if not eid:
                continue
            summary = ""
            if isinstance(ev.get("summary"), str):
                summary = ev["summary"]
            elif isinstance(ev.get("summary"), dict):
                summary = str(ev["summary"].get("content") or "")
            if not summary:
                summary = str(ev.get("_calendar_summary") or f"Event {eid}")
            remote.append(
                {
                    "id": eid,
                    "object": "calendar_event",
                    "title": summary,
                    "url": None,
                    "last_edited_time": now,
                    "content_text": summary[:400],
                    "parent": {"type": "feishu_calendar", "feishu_calendar": "primary"},
                }
            )
        for f in files or []:
            token = str(f.get("token") or f.get("file_token") or "")
            if not token:
                continue
            name = str(f.get("name") or token)
            remote.append(
                {
                    "id": token,
                    "object": "file",
                    "title": f"Doc · {name}",
                    "url": f.get("url"),
                    "last_edited_time": str(f.get("modified_time") or now),
                    "content_text": f"type={f.get('type')}",
                    "parent": {"type": "feishu_drive", "feishu_drive": "root"},
                }
            )
        return remote


feishu_client = FeishuClient()
