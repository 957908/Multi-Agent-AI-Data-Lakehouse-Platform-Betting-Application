"""
मराठी टिप्पणी: हा repository layer आहे. सध्या in-memory storage वापरतो, पण production मध्ये याच interface मागे PostgreSQL/SQLAlchemy implementation बसवता येईल.
"""

from __future__ import annotations

from collections.abc import Iterable
from uuid import UUID

from app.domain.entities import Platform


class PlatformRepository:
    """Repository boundary for platform persistence.

    The in-memory implementation keeps local development and tests fast. A SQLAlchemy
    implementation can satisfy the same interface in production without changing services.
    """

    def __init__(self) -> None:
        self._platforms: dict[UUID, Platform] = {}

    async def add(self, platform: Platform) -> Platform:
        self._platforms[platform.id] = platform
        return platform

    async def get(self, platform_id: UUID) -> Platform | None:
        return self._platforms.get(platform_id)

    async def list(self) -> Iterable[Platform]:
        return tuple(self._platforms.values())

    async def search(self, query: str) -> Iterable[Platform]:
        normalized = query.casefold()
        return tuple(p for p in self._platforms.values() if normalized in p.name.casefold())
