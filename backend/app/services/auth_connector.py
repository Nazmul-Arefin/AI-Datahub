"""OAuth / token exchange — wire to nango adapter."""


class AuthConnector:
    async def exchange_code(self, code: str, state: str) -> dict[str, str]:
        return {"accessToken": "stub-token", "provider": "stub"}


auth_connector = AuthConnector()
