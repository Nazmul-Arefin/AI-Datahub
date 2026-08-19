"""Nango OAuth connector — Elastic license; see docs/licenses.md."""

from __future__ import annotations

from uuid import uuid4

import httpx

from app.core.config import settings


class NangoClient:
    def __init__(
        self,
        base_url: str | None = None,
        secret_key: str | None = None,
        connect_url: str | None = None,
        mode: str | None = None,
    ) -> None:
        self.base_url = (base_url or settings.nango_url).rstrip("/")
        self.secret_key = settings.nango_secret_key if secret_key is None else secret_key
        self.connect_url = (connect_url or settings.nango_connect_url).rstrip("/")
        self.mode = mode or settings.nango_mode

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
                headers={
                    "Authorization": f"Bearer {self.secret_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            if response.status_code >= 400 and "allowed_integrations" in payload:
                payload.pop("allowed_integrations", None)
                response = await client.post(
                    f"{self.base_url}/connect/sessions",
                    headers={
                        "Authorization": f"Bearer {self.secret_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
            response.raise_for_status()
            body = response.json()
        data = body.get("data", body)
        session = data.get("token") or data.get("sessionToken") or uuid4().hex
        link = data.get("connect_link") or f"{self.connect_url}?session_token={session}"
        return {
            "authorizationUrl": link,
            "state": f"nango-{integration_id}-{uuid4().hex[:8]}",
            "credentialRef": f"cred_nango_{uuid4().hex[:12]}",
            "mode": "live",
        }

    async def finish_connect(self, code: str, state: str) -> dict:
        provider = "nango"
        if state.startswith("nango-"):
            parts = state.split("-")
            if len(parts) >= 2:
                provider = parts[1]
        return {
            "status": "connected",
            "provider": provider,
            "credentialRef": f"cred_{provider}_{code[:8] or 'ref'}",
            "mode": self.mode,
        }

    async def refresh_credential(self, credential_ref: str) -> dict:
        return {"status": "ok", "credentialRef": credential_ref, "mode": self.mode}


nango_client = NangoClient()
