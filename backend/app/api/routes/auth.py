from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.dependencies import get_db_session
from app.core.security import TokenType, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import LoginRequest, RefreshRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserRead, status_code=201)
async def register_user(payload: UserCreate, session: AsyncSession = Depends(get_db_session)) -> UserRead:
    user = await user_service.create_user(session, payload)
    return UserRead.model_validate(user, from_attributes=True)


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_db_session)) -> Token:
    user = await user_service.authenticate_user(session, payload.email, payload.password)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    return Token(access_token=access_token, refresh_token=refresh_token, expires_at=expires_at)


@router.post("/refresh", response_model=Token)
async def refresh_token(payload: RefreshRequest) -> Token:
    decoded = decode_token(payload.refresh_token, token_type=TokenType.REFRESH)
    sub = int(decoded["sub"])
    access_token = create_access_token(sub)
    refresh_token = create_refresh_token(sub)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    return Token(access_token=access_token, refresh_token=refresh_token, expires_at=expires_at)
