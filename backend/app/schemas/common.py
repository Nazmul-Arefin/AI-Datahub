from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str
    version: str = "0.1.0"
    environment: str


class PaginatedMeta(BaseModel):
    total: int
    page: int = 1
    page_size: int = Field(default=50, alias="pageSize")

    model_config = {"populate_by_name": True}
