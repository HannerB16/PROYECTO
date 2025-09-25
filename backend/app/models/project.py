from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column
from sqlalchemy.dialects.sqlite import JSON
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:  # pragma: no cover
    from .workspace import Workspace


class Project(SQLModel, table=True):
    __tablename__ = "project"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str | None = Field(default=None, max_length=500)
    workspace_id: int = Field(foreign_key="workspace.id")
    status: str = Field(default="active", max_length=50)
    health_score: float = Field(default=0.75)
    velocity: float = Field(default=1.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    workspace: "Workspace" = Relationship(back_populates="projects")


class ProjectPulse(SQLModel, table=True):
    __tablename__ = "project_pulse"

    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    week_start: datetime = Field(default_factory=datetime.utcnow)
    focus_areas: list[str] | None = Field(
        default=None,
        sa_column=Column(JSON, nullable=True),
    )
    risk_level: str = Field(default="low", max_length=20)
    ai_recommendation: str | None = Field(default=None)


__all__ = ["Project", "ProjectPulse"]
