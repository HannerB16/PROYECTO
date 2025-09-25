from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class MetricPoint(BaseModel):
    label: str
    value: float
    trend: float | None = None


class AnalyticsOverview(BaseModel):
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    health_index: float
    velocity_index: float
    automation_rate: float
    ai_recommendations: list[str]
    highlights: list[MetricPoint]
