"""OAuth / API-key connect — API → AuthConnector → Nango. Never return tokens."""

from app.adapters.nango.client import nango_client


class AuthConnector:
    def __init__(self, client=nango_client) -> None:
        self._client = client

    async def authorize(self, integration_key: str, redirect_uri: str | None = None) -> dict:
        return await self._client.create_connect_session(integration_key, redirect_uri)

    async def callback(self, code: str, state: str) -> dict:
        return await self._client.finish_connect(code, state)

    async def refresh(self, credential_ref: str) -> dict:
        return await self._client.refresh_credential(credential_ref)

    async def exchange_code(self, code: str, state: str) -> dict:
        """Alias for callback — stores a credential reference, not an access token."""
        return await self.callback(code, state)


auth_connector = AuthConnector()
