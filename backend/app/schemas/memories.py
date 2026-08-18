from pydantic import BaseModel


class MemoryProposal(BaseModel):
    id: str
    title: str
    summary: str
    source: str | None = None
    confidence: float | None = None


class MemoryListResponse(BaseModel):
    proposals: list[MemoryProposal]
    total: int
