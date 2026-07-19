from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class PlatformCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    url: HttpUrl
    country: str | None = Field(default=None, max_length=80)
    license_status: str | None = Field(default=None, max_length=120)


class PlatformRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    url: str
    country: str | None = None
    license_status: str | None = None
    created_at: datetime


class PlatformAnalytics(BaseModel):
    platform_id: UUID
    review_count: int
    complaint_count: int
    trust_score: float
    risk_score: float
