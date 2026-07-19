"""
मराठी टिप्पणी: हा domain layer आहे. Platform, Review आणि TrustScore सारख्या core business entities framework-independent स्वरूपात परिभाषित आहेत.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(slots=True)
class Platform:
    name: str
    url: str
    country: str | None = None
    license_status: str | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class Review:
    platform_id: UUID
    rating: float
    content: str
    source: str
    author: str | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class TrustScore:
    platform_id: UUID
    score: float
    risk_level: RiskLevel
    explanation: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow)
