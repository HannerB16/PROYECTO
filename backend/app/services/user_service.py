from __future__ import annotations

from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


async def create_user(session: AsyncSession, payload: UserCreate) -> User:
    existing = await session.exec(select(User).where(User.email == payload.email))
    if existing.first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def authenticate_user(session: AsyncSession, email: str, password: str) -> User:
    result = await session.exec(select(User).where(User.email == email))
    user = result.first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Cuenta desactivada")
    user.updated_at = datetime.utcnow()
    await session.commit()
    return user


async def get_user_by_id(session: AsyncSession, user_id: int) -> User:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
