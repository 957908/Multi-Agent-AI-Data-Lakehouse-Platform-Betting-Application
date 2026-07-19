"""
मराठी टिप्पणी: हा controller layer आहे. Platform create, list, search आणि detail APIs HTTP request स्वीकारून service layer कडे काम सोपवतात.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_platform_service
from app.schemas.platforms import PlatformCreate, PlatformRead
from app.services.platform_service import PlatformService

router = APIRouter(prefix="/platforms", tags=["platforms"])


@router.post("", response_model=PlatformRead, status_code=status.HTTP_201_CREATED)
async def create_platform(
    payload: PlatformCreate,
    service: PlatformService = Depends(get_platform_service),
) -> PlatformRead:
    return PlatformRead.model_validate(await service.create_platform(payload))


@router.get("", response_model=list[PlatformRead])
async def list_platforms(
    q: str | None = Query(default=None, description="Optional platform name search"),
    service: PlatformService = Depends(get_platform_service),
) -> list[PlatformRead]:
    platforms = await service.search_platforms(q) if q else await service.list_platforms()
    return [PlatformRead.model_validate(platform) for platform in platforms]


@router.get("/{platform_id}", response_model=PlatformRead)
async def get_platform(
    platform_id: UUID,
    service: PlatformService = Depends(get_platform_service),
) -> PlatformRead:
    platform = await service.get_platform(platform_id)
    if platform is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Platform not found")
    return PlatformRead.model_validate(platform)
