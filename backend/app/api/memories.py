from fastapi import APIRouter, HTTPException, Query, status
from httpx import HTTPError

from app.core.deps import CurrentUserId
from app.schemas.memories import (
    MemoryCreateRequest,
    MemoryDeleteResponse,
    MemoryListResponse,
    MemoryPatchRequest,
    MemoryRecord,
    MemorySearchResponse,
)
from app.services.memory_service import memory_service

router = APIRouter()


def _sidecar_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Memory sidecar error",
    )


@router.get("/proposals", response_model=MemoryListResponse)
async def list_proposals(_user_id: CurrentUserId) -> MemoryListResponse:
    result = await memory_service.list_proposals()
    return MemoryListResponse.model_validate(result)


@router.post("", response_model=MemoryRecord)
async def create_memory(payload: MemoryCreateRequest, _user_id: CurrentUserId) -> MemoryRecord:
    try:
        result = await memory_service.store(
            title=payload.title,
            content=payload.content,
            source=payload.source,
        )
    except HTTPError as exc:
        raise _sidecar_error() from exc
    return MemoryRecord.model_validate(result)


@router.get("", response_model=MemorySearchResponse)
async def search_memories(
    _user_id: CurrentUserId,
    q: str = Query(default=""),
) -> MemorySearchResponse:
    try:
        result = await memory_service.search(q)
    except HTTPError as exc:
        raise _sidecar_error() from exc
    return MemorySearchResponse.model_validate(result)


@router.get("/{memory_id}", response_model=MemoryRecord)
async def get_memory(memory_id: str, _user_id: CurrentUserId) -> MemoryRecord:
    try:
        result = await memory_service.recall(memory_id)
    except HTTPError as exc:
        raise _sidecar_error() from exc
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
    return MemoryRecord.model_validate(result)


@router.patch("/{memory_id}", response_model=MemoryRecord)
async def patch_memory(
    memory_id: str,
    payload: MemoryPatchRequest,
    _user_id: CurrentUserId,
) -> MemoryRecord:
    fields = payload.model_dump(exclude_none=True)
    try:
        result = await memory_service.update(memory_id, **fields)
    except HTTPError as exc:
        raise _sidecar_error() from exc
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
    return MemoryRecord.model_validate(result)


@router.delete("/{memory_id}", response_model=MemoryDeleteResponse)
async def delete_memory(memory_id: str, _user_id: CurrentUserId) -> MemoryDeleteResponse:
    try:
        result = await memory_service.delete(memory_id)
    except HTTPError as exc:
        raise _sidecar_error() from exc
    return MemoryDeleteResponse.model_validate(result)
