from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from .links import WorkspaceUserLink

if TYPE_CHECKING:  # pragma: no cover - solo para tipado
    from .workspace import Workspace


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    workspaces: list["Workspace"] = Relationship(
        back_populates="members",
        link_model=WorkspaceUserLink,
        sa_relationship_kwargs={"lazy": "selectin"},
    )

    owned_workspaces: list["Workspace"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"lazy": "selectin"}
    )


__all__ = ["User"]
