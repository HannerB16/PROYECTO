from __future__ import annotations

from random import random

from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.project import Project
from app.schemas.analytics import AnalyticsOverview, MetricPoint
from app.utils.ai import generate_recommendation


async def build_overview(session: AsyncSession) -> AnalyticsOverview:
    project_count_result = await session.exec(select(func.count(Project.id)))
    total_projects = float(project_count_result.one() or 0)

    avg_health_result = await session.exec(select(func.avg(Project.health_score)))
    avg_velocity_result = await session.exec(select(func.avg(Project.velocity)))
    avg_health_value = float(avg_health_result.one() or 0.0)
    avg_velocity_value = float(avg_velocity_result.one() or 0.0)

    highlights = [
        MetricPoint(label="Proyectos activos", value=total_projects),
        MetricPoint(label="Salud promedio", value=avg_health_value, trend=random()),
        MetricPoint(label="Velocidad promedio", value=avg_velocity_value, trend=random()),
    ]

    recommendations = [
        generate_recommendation(),
        "Revisa la salud de los proyectos con tendencia negativa",
        "Activa el módulo de predicción de incidentes para tu workspace principal",
    ]

    return AnalyticsOverview(
        health_index=avg_health_value,
        velocity_index=avg_velocity_value,
        automation_rate=0.42 + random() / 10,
        ai_recommendations=recommendations,
        highlights=highlights,
    )

