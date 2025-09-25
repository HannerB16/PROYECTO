from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class ProjectBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: str | None = Field(default=None, max_length=500)
    status: str = Field(default="active", max_length=50)
    health_score: float = Field(default=0.75, ge=0, le=1)
    velocity: float = Field(default=1.0, ge=0)


class ProjectCreate(ProjectBase):
    workspace_id: int


class ProjectRead(ProjectBase):
    id: int
    workspace_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProjectPulseRead(BaseModel):
    id: int
    project_id: int
    week_start: datetime
    focus_areas: list[str] | None
    risk_level: str
    ai_recommendation: str | None
    model_config = ConfigDict(from_attributes=True)
