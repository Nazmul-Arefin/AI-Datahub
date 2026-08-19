"""HTTP ping for sidecar health — used only via SidecarHealthService."""

from __future__ import annotations

import httpx

# 404 is not healthy — try the next path. 401/403 still mean the process answered.
_REACHABLE = frozenset(range(200, 400)) | {401, 403}


class SidecarHealthClient:
    async def ping(self, url: str, timeout_seconds: float) -> tuple[bool, str]:
        base = url.rstrip("/")
        paths = ("/health", "/", "")
        last_error = "no response"
        async with httpx.AsyncClient(timeout=timeout_seconds, follow_redirects=True) as client:
            for path in paths:
                target = f"{base}{path}" if path else base
                try:
                    response = await client.get(target)
                except httpx.HTTPError as exc:
                    last_error = exc.__class__.__name__
                    continue
                if response.status_code in _REACHABLE:
                    return True, f"http {response.status_code}"
                last_error = f"http {response.status_code}"
        return False, last_error


sidecar_health_client = SidecarHealthClient()
