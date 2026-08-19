"""Aggregate sidecar health through adapters — routers must not ping URLs."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app.adapters.sidecar_health.client import sidecar_health_client
from app.core.config import Settings, get_settings
from app.schemas.common import SidecarHealthResponse, SidecarStatus


class SidecarPinger(Protocol):
    async def ping(self, url: str, timeout_seconds: float) -> tuple[bool, str]: ...


@dataclass(frozen=True)
class _SidecarSpec:
    name: str
    url: str
    mode: str


class SidecarHealthService:
    def __init__(
        self,
        client: SidecarPinger | None = None,
        settings: Settings | None = None,
    ) -> None:
        self._client = client or sidecar_health_client
        self._settings = settings or get_settings()

    def _specs(self) -> list[_SidecarSpec]:
        settings = self._settings
        return [
            _SidecarSpec("nango", settings.nango_url, settings.nango_mode),
            _SidecarSpec("memory", settings.memory_service_url, settings.memory_mode),
            _SidecarSpec("harness", settings.agent_harness_url, settings.harness_mode),
            _SidecarSpec("astrbot", settings.astrbot_url, settings.astrbot_mode),
            _SidecarSpec("mcp_gateway", settings.mcp_gateway_url, settings.mcp_gateway_mode),
        ]

    async def check_all(self) -> SidecarHealthResponse:
        sidecars: list[SidecarStatus] = []
        for spec in self._specs():
            ok, detail = await self._client.ping(spec.url, self._settings.sidecar_health_timeout_seconds)
            sidecars.append(
                SidecarStatus(
                    name=spec.name,
                    mode=spec.mode,
                    status="ok" if ok else "down",
                    url=spec.url,
                    detail=detail,
                )
            )
        overall = "ok" if all(item.status == "ok" for item in sidecars) else "degraded"
        return SidecarHealthResponse(status=overall, sidecars=sidecars)


sidecar_health_service = SidecarHealthService()
