from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.dependencies import get_current_user, get_db_session
from app.models.user import User
from app.schemas.analytics import AnalyticsOverview
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> AnalyticsOverview:
    return await analytics_service.build_overview(session)
