from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class WorkspaceUserLink(SQLModel, table=True):
    __tablename__ = "workspace_user_link"

    workspace_id: Optional[int] = Field(default=None, foreign_key="workspace.id", primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id", primary_key=True)
    role: str = Field(default="member", max_length=30)
    joined_at: datetime = Field(default_factory=datetime.utcnow)
