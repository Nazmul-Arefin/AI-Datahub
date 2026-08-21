"""Nango OAuth connector — Elastic license; see docs/licenses.md."""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from uuid import uuid4

import httpx

from app.core.config import settings

_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


class NangoClient:
    def __init__(
        self,
        base_url: str | None = None,
        secret_key: str | None = None,
        connect_url: str | None = None,
        public_url: str | None = None,
        mode: str | None = None,
    ) -> None:
        self.base_url = (base_url or settings.nango_url).rstrip("/")
        self.secret_key = settings.nango_secret_key if secret_key is None else secret_key
        self.connect_url = (connect_url or settings.nango_connect_url).rstrip("/")
        self.public_url = (public_url or settings.nango_public_url).rstrip("/")
        self.mode = mode or settings.nango_mode

    def _auth_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    def _with_local_api_url(self, link: str) -> str:
        """Self-hosted Connect UI defaults to api.nango.dev; force local API."""
        parts = urlsplit(link)
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        query["apiURL"] = self.public_url
        return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))

    async def create_connect_session(self, integration_id: str, redirect_uri: str | None) -> dict:
        if self.mode != "live" or not self.secret_key:
            state = f"nango-{integration_id}-{uuid4().hex[:8]}"
            return {
                "authorizationUrl": f"{self.base_url}/oauth/connect/{integration_id}",
                "state": state,
                "mode": "mock",
            }
        payload: dict = {
            "end_user": {
                "id": "dev-user",
                "email": "dev2@weeple.local",
                "display_name": "Developer 2",
            },
            "tags": {"end_user_id": "dev-user", "integration": integration_id},
        }
        if integration_id:
            payload["allowed_integrations"] = [integration_id]
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{self.base_url}/connect/sessions",
                headers=self._auth_headers(),
                json=payload,
            )
            if response.status_code >= 400 and "allowed_integrations" in payload:
                payload.pop("allowed_integrations", None)
                response = await client.post(
                    f"{self.base_url}/connect/sessions",
                    headers=self._auth_headers(),
                    json=payload,
                )
            response.raise_for_status()
            body = response.json()
        data = body.get("data", body)
        session = data.get("token") or data.get("sessionToken") or uuid4().hex
        link = data.get("connect_link") or f"{self.connect_url}?session_token={session}"
        link = self._with_local_api_url(link)
        return {
            "authorizationUrl": link,
            "state": f"nango-{integration_id}-{uuid4().hex[:8]}",
            "credentialRef": f"cred_nango_{uuid4().hex[:12]}",
            "mode": "live",
        }

    async def finish_connect(self, code: str, state: str) -> dict:
        """Persist the Connect UI connectionId as the Nango external id."""
        provider = "nango"
        if state.startswith("nango-"):
            parts = state.split("-")
            if len(parts) >= 2:
                provider = parts[1]
        connection_id = (code or "").strip() or f"ext-{uuid4().hex[:12]}"
        return {
            "status": "connected",
            "provider": provider,
            "externalConnectionId": connection_id,
            "credentialRef": connection_id,
            "mode": self.mode,
        }

    async def refresh_credential(self, credential_ref: str) -> dict:
        return {"status": "ok", "credentialRef": credential_ref, "mode": self.mode}

    async def list_connections(self, provider_config_key: str | None = None) -> list[dict[str, Any]]:
        if self.mode != "live" or not self.secret_key:
            return []
        params: dict[str, str] = {}
        if provider_config_key:
            # Some Nango builds filter client-side; still request the list.
            params["integrationId"] = provider_config_key
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                f"{self.base_url}/connections",
                headers=self._auth_headers(),
                params=params or None,
            )
            response.raise_for_status()
            body = response.json()
        rows = body.get("connections") or body.get("data") or []
        if provider_config_key:
            rows = [
                row
                for row in rows
                if (row.get("provider_config_key") or row.get("provider") or "") == provider_config_key
            ]
        return list(rows)

    async def resolve_connection_id(
        self,
        stored: str | None,
        provider_config_key: str,
    ) -> str | None:
        """Map a stored ref (full UUID or legacy cred_nango_<prefix>) to Nango connection_id."""
        if stored and _UUID_RE.match(stored.strip()):
            return stored.strip()

        rows = await self.list_connections(provider_config_key)
        if not rows:
            return stored

        if stored:
            fragment = stored.strip()
            if fragment.startswith("cred_"):
                fragment = fragment.rsplit("_", 1)[-1]
            for row in rows:
                cid = str(row.get("connection_id") or "")
                if cid == stored or (fragment and cid.startswith(fragment)):
                    return cid

        # Prefer the newest connection for this integration.
        rows_sorted = sorted(rows, key=lambda r: str(r.get("created") or ""), reverse=True)
        return str(rows_sorted[0].get("connection_id") or "") or stored

    async def proxy(
        self,
        method: str,
        endpoint: str,
        *,
        connection_id: str,
        provider_config_key: str,
        json_body: dict | list | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        if self.mode != "live" or not self.secret_key:
            raise RuntimeError("Nango proxy requires live mode and a secret key")

        path = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        headers = {
            **self._auth_headers(),
            "Connection-Id": connection_id,
            "Provider-Config-Key": provider_config_key,
            "Retries": "2",
        }
        if extra_headers:
            headers.update(extra_headers)

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.request(
                method.upper(),
                f"{self.base_url}/proxy{path}",
                headers=headers,
                json=json_body,
            )
            if response.status_code >= 400:
                detail = response.text[:500]
                raise RuntimeError(f"Nango proxy {response.status_code}: {detail}")
            if not response.content:
                return {}
            return response.json()


nango_client = NangoClient()
