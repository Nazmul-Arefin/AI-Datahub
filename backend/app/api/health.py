from fastapi import APIRouter

from app.core.config import settings
from app.schemas.common import HealthResponse, LlmHealthResponse, SidecarHealthResponse
from app.services.llm_service import llm_service
from app.services.sidecar_health_service import sidecar_health_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(service=settings.app_name, environment=settings.app_env)


@router.get("/health/sidecars", response_model=SidecarHealthResponse)
async def sidecar_health() -> SidecarHealthResponse:
    return await sidecar_health_service.check_all()


@router.get("/health/llm", response_model=LlmHealthResponse)
async def llm_health() -> LlmHealthResponse:
    result = await llm_service.ping()
    return LlmHealthResponse.model_validate(result)
