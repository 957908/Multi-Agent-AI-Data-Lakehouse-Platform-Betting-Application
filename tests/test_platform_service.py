import pytest

from app.repositories.platform_repository import PlatformRepository
from app.schemas.platforms import PlatformCreate
from app.services.platform_service import PlatformService


@pytest.mark.asyncio
async def test_platform_service_create_and_search():
    service = PlatformService(PlatformRepository())
    created = await service.create_platform(PlatformCreate(name="Stake", url="https://stake.example"))

    assert created.name == "Stake"
    assert (await service.get_platform(created.id)).id == created.id
    assert len(await service.search_platforms("sta")) == 1
