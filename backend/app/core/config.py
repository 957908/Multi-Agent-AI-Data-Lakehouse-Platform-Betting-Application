"""
मराठी टिप्पणी: हे configuration module आहे. Environment variables मधून database, Kafka, MinIO, MLflow आणि app settings वाचले जातात.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Betting Intelligence Lakehouse"
    environment: str = "development"
    database_url: str = "postgresql+asyncpg://lakehouse:lakehouse@postgres:5432/lakehouse"
    jwt_secret_key: str = "change-me"
    kafka_bootstrap_servers: str = "kafka:9092"
    minio_endpoint: str = "http://minio:9000"
    mlflow_tracking_uri: str = "http://mlflow:5000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
