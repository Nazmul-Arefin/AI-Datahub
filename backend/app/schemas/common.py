from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str
    version: str = "0.1.0"
    environment: str


class SidecarStatus(BaseModel):
    name: str
    mode: str
    status: str
    url: str
    detail: str | None = None


class SidecarHealthResponse(BaseModel):
    status: str
    sidecars: list[SidecarStatus]


class LlmHealthResponse(BaseModel):
    status: str
    mode: str
    model: str
    preview: str | None = None


class PaginatedMeta(BaseModel):
    total: int
    page: int = 1
    page_size: int = Field(default=50, alias="pageSize")

    model_config = {"populate_by_name": True}


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict | list | None = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
