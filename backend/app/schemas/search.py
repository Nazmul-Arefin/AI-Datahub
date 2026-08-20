from pydantic import BaseModel, Field


class SearchHit(BaseModel):
    id: str
    type: str  # goal | source | task | memory | activity | catalog
    title: str
    detail: str | None = None
    route: str  # overview | goals | import-data | use-data
    score: float = 0
    meta: dict | None = None

    model_config = {"populate_by_name": True, "ser_json_by_alias": True}


class SearchResponse(BaseModel):
    query: str
    total: int
    items: list[SearchHit] = Field(default_factory=list)
    summary: str | None = None

    model_config = {"populate_by_name": True, "ser_json_by_alias": True}
