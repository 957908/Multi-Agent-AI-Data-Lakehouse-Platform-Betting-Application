from functools import lru_cache

from app.repositories.platform_repository import PlatformRepository
from app.services.platform_service import PlatformService


@lru_cache
def get_platform_repository() -> PlatformRepository:
    return PlatformRepository()


def get_platform_service() -> PlatformService:
    return PlatformService(get_platform_repository())
