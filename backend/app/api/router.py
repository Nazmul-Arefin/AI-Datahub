from fastapi import APIRouter

from app.api import (
    agents,
    auth,
    goals,
    health,
    integrations,
    memories,
    messaging,
    overview,
    sources,
    tasks,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(overview.router, prefix="/overview", tags=["overview"])
api_router.include_router(memories.router, prefix="/memories", tags=["memories"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(messaging.router, prefix="/messaging", tags=["messaging"])
