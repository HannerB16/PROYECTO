from __future__ import annotations

import secrets
from functools import lru_cache

from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración principal de AuroraOps."""

    model_config = SettingsConfigDict(env_prefix="auroraops_", case_sensitive=False)

    app_name: str = "AuroraOps API"
    environment: str = Field(default="development", alias="env")

    database_url: AnyUrl | str = Field(
        default="sqlite+aiosqlite:///./auroraops.db",
        description="Cadena de conexión SQLAlchemy compatible con SQLModel",
    )

    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 30  # 30 días

    redis_url: AnyUrl | str | None = Field(
        default=None, description="Cadena de conexión Redis para cachés opcionales"
    )

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
    )

    telemetry_endpoint: AnyUrl | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
