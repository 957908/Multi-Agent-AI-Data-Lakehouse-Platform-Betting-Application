"""
मराठी टिप्पणी: हे FastAPI application entrypoint आहे. येथे API app तयार होते, CORS middleware जोडले जाते, platform routes register होतात आणि health check endpoint दिला जातो.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import get_platform_service
from app.api.v1.platforms import router as platforms_router
from app.core.config import get_settings
from app.schemas.platforms import PlatformCreate

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(platforms_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.on_event("startup")
async def seed_demo_platforms() -> None:
    """Seed demo platforms so the live dashboard has useful first-run data."""
    service = get_platform_service()
    if await service.list_platforms():
        return
    for name, url in (
        ("Stake", "https://stake.example"),
        ("Melbet", "https://melbet.example"),
        ("Parimatch", "https://parimatch.example"),
    ):
        await service.create_platform(PlatformCreate(name=name, url=url))
