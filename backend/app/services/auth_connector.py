"""OAuth / API-key connect — API → AuthConnector → Nango. Never return tokens.

Dev1 calls start_authorization / exchange_code / refresh / revoke.
Dev2 implements the Nango client behind this facade.
"""

from app.adapters.nango.client import nango_client
from app.core.config import settings
from app.schemas.sources import ConnectStartResponse


class AuthConnector:
    def __init__(self, client=nango_client) -> None:
        self._client = client

    async def authorize(self, integration_key: str, redirect_uri: str | None = None) -> dict:
        return await self._client.create_connect_session(integration_key, redirect_uri)

    async def start_authorization(
        self,
        integration_key: str,
        redirect_uri: str | None,
        user_id: str,
        state: str,
    ) -> ConnectStartResponse:
        result = await self.authorize(integration_key, redirect_uri)
        url = result.get("authorizationUrl") or (
            f"{settings.api_public_url.rstrip('/')}/integrations/callback"
            f"?code=dev-ok&state={state}"
        )
        # Import Data persists OAuth state in our API. Mock Nango URLs are not
        # that callback, so the demo loop still returns our callback URL.
        if result.get("mode") != "live" and "integrations/callback" not in url:
            url = (
                f"{settings.api_public_url.rstrip('/')}/integrations/callback"
                f"?code=dev-ok&state={state}"
            )
        return ConnectStartResponse(authorizationUrl=url, state=state)

    async def callback(self, code: str, state: str) -> dict:
        return await self._client.finish_connect(code, state)

    async def exchange_code(self, code: str, state: str, user_id: str | None = None) -> dict:
        result = await self.callback(code, state)
        return {
            "provider": result.get("provider", "nango"),
            "externalConnectionId": result.get("credentialRef")
            or result.get("externalConnectionId")
            or f"ext-{state[:12]}",
        }

    async def refresh(self, connection_id: str) -> dict:
        return await self._client.refresh_credential(connection_id)

    async def revoke(self, connection_id: str) -> None:
        revoke = getattr(self._client, "revoke", None)
        if callable(revoke):
            await revoke(connection_id)


auth_connector = AuthConnector()
