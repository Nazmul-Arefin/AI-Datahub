from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.responses import HTMLResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.schemas.common import HealthResponse


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if settings.use_database:
        from app.core.database import SessionLocal, init_database
        from app.services.seed_db import seed_database

        init_database()
        if SessionLocal is not None:
            db = SessionLocal()
            try:
                seed_database(db)
                db.commit()
            finally:
                db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
    # Serve /docs and /docs/ as 200 ourselves. Starlette's slash redirect
    # (/docs/ → /docs) loops in some browsers that re-add the trailing slash.
    docs_url=None,
    redoc_url=None,
    swagger_ui_oauth2_redirect_url=None,
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_prefix)


def _swagger_ui() -> HTMLResponse:
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=f"{settings.app_name} — Docs",
    )


def _redoc_ui() -> HTMLResponse:
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=f"{settings.app_name} — ReDoc",
    )


if settings.debug:
    @app.get("/docs", include_in_schema=False)
    async def swagger_ui() -> HTMLResponse:
        return _swagger_ui()

    @app.get("/docs/", include_in_schema=False)
    async def swagger_ui_slash() -> HTMLResponse:
        return _swagger_ui()

    @app.get("/redoc", include_in_schema=False)
    async def redoc_ui() -> HTMLResponse:
        return _redoc_ui()

    @app.get("/redoc/", include_in_schema=False)
    async def redoc_ui_slash() -> HTMLResponse:
        return _redoc_ui()


@app.get("/health", response_model=HealthResponse)
async def root_health() -> HealthResponse:
    """Convenience alias so http://127.0.0.1:8000/health also works."""
    return HealthResponse(service=settings.app_name, environment=settings.app_env)


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "health": f"{settings.api_prefix}/health",
    }
