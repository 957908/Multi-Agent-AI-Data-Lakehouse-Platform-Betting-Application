"""
मराठी टिप्पणी: हे security helper module आहे. Password hashing, password verification आणि JWT access token generation येथे केले जाते.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(subject: str, roles: list[str], expires_minutes: int = 60) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "roles": roles,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")
