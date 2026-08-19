"""OAuth / token exchange interface.

Dev1 owns this contract. Dev2 implements Nango in `app.adapters.nango`.
"""

from app.core.config import settings
from app.schemas.sources import ConnectStartResponse


class AuthConnector:
    async def start_authorization(
        self,
        integration_key: str,
        redirect_uri: str | None,
        user_id: str,
        state: str,
    ) -> ConnectStartResponse:
        # Stub URL completes the demo loop via our own callback until Dev2 wires Nango.
        callback = (
            f"{settings.api_public_url.rstrip('/')}/integrations/callback"
            f"?code=dev-ok&state={state}"
        )
        return ConnectStartResponse(authorizationUrl=callback, state=state)

    async def exchange_code(self, code: str, state: str, user_id: str | None = None) -> dict[str, str]:
        return {
            "accessToken": "stub-token",
            "provider": "nango",
            "externalConnectionId": f"ext-{state[:12]}",
        }

    async def refresh(self, connection_id: str) -> dict[str, str]:
        return {"status": "ok", "connectionId": connection_id}

    async def revoke(self, connection_id: str) -> None:
        return None


auth_connector = AuthConnector()
