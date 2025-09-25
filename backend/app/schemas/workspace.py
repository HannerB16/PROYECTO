from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict

from .user import UserPublic


class WorkspaceBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: str | None = Field(default=None, max_length=500)
    industry: str | None = Field(default=None, max_length=120)


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceRead(WorkspaceBase):
    id: int
    created_at: datetime
    owner_id: int | None
    model_config = ConfigDict(from_attributes=True)


class WorkspaceDetail(WorkspaceRead):
    owner: UserPublic | None
    members: list[UserPublic]
    model_config = ConfigDict(from_attributes=True)
