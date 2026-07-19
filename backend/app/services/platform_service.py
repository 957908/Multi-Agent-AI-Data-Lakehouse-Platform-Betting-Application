"""
मराठी टिप्पणी: हा service layer आहे. Platform संदर्भातील business logic येथे ठेवले आहे आणि repository मार्फत data access केला जातो.
"""

from uuid import UUID

from app.domain.entities import Platform
from app.repositories.platform_repository import PlatformRepository
from app.schemas.platforms import PlatformCreate


class PlatformService:
    def __init__(self, repository: PlatformRepository) -> None:
        self.repository = repository

    async def create_platform(self, payload: PlatformCreate) -> Platform:
        platform = Platform(
            name=payload.name,
            url=str(payload.url),
            country=payload.country,
            license_status=payload.license_status,
        )
        return await self.repository.add(platform)

    async def get_platform(self, platform_id: UUID) -> Platform | None:
        return await self.repository.get(platform_id)

    async def list_platforms(self) -> list[Platform]:
        return list(await self.repository.list())

    async def search_platforms(self, query: str) -> list[Platform]:
        return list(await self.repository.search(query))
