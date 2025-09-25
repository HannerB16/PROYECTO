from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncEngine, AsyncSession, create_async_engine

from app.core.config import get_settings

_settings = get_settings()
engine: AsyncEngine = create_async_engine(
    str(_settings.database_url), echo=_settings.environment == "development"
)


async def init_db() -> None:
    """Crea las tablas en la base de datos."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine) as session:
        yield session
