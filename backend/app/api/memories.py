from fastapi import APIRouter

from app.core.deps import CurrentUserId
from app.schemas.memories import MemoryListResponse
from app.services.memory_service import memory_service

router = APIRouter()


@router.get("/proposals", response_model=MemoryListResponse)
async def list_proposals(_user_id: CurrentUserId) -> MemoryListResponse:
    result = await memory_service.list_proposals()
    return MemoryListResponse.model_validate(result)
