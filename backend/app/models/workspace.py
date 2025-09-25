from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from .links import WorkspaceUserLink

if TYPE_CHECKING:  # pragma: no cover
    from .project import Project
    from .user import User


class Workspace(SQLModel, table=True):
    __tablename__ = "workspace"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str | None = None
    industry: str | None = Field(default=None, max_length=120)
    owner_id: int | None = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner: "User" | None = Relationship(
        back_populates="owned_workspaces", sa_relationship_kwargs={"lazy": "selectin"}
    )
    members: list["User"] = Relationship(
        back_populates="workspaces",
        link_model=WorkspaceUserLink,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    projects: list["Project"] = Relationship(
        back_populates="workspace", sa_relationship_kwargs={"lazy": "selectin"}
    )


__all__ = ["Workspace"]
