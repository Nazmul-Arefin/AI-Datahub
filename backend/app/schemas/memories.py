from pydantic import BaseModel, Field


class MemoryProposal(BaseModel):
    id: str
    title: str
    summary: str
    source: str | None = None
    confidence: float | None = None


class MemoryListResponse(BaseModel):
    proposals: list[MemoryProposal]
    total: int


class MemoryCreateRequest(BaseModel):
    title: str
    content: str
    source: str | None = None


class MemoryRecord(BaseModel):
    id: str
    title: str
    content: str
    source: str | None = None
    mode: str | None = None
    use_for_ai: bool = Field(default=True, alias="useForAi")

    model_config = {"populate_by_name": True}


class MemoryDeleteResponse(BaseModel):
    deleted: bool
    id: str


class MemoryPatchRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    source: str | None = None
    use_for_ai: bool | None = Field(default=None, alias="useForAi")

    model_config = {"populate_by_name": True}

class MemorySearchResponse(BaseModel):
    items: list[MemoryRecord]
    total: int
    mode: str | None = None
