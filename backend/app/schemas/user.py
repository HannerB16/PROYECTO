from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., max_length=200)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserPublic(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class UserAuth(UserBase):
    hashed_password: str
