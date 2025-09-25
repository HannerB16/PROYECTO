from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.dependencies import get_current_user, get_db_session
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectPulseRead, ProjectRead
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectRead, status_code=201)
async def create_project(
    payload: ProjectCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
    project = await project_service.create_project(session, payload, current_user.id)
    return ProjectRead.model_validate(project, from_attributes=True)


@router.get("", response_model=list[ProjectRead])
async def list_projects(
    workspace_id: int,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[ProjectRead]:
    projects = await project_service.list_projects(session, workspace_id, current_user.id)
    return [ProjectRead.model_validate(project, from_attributes=True) for project in projects]


@router.get("/{project_id}/pulse", response_model=list[ProjectPulseRead])
async def get_project_pulse(
    project_id: int,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[ProjectPulseRead]:
    pulses = await project_service.get_project_pulses(session, project_id, current_user.id)
    return [ProjectPulseRead.model_validate(pulse, from_attributes=True) for pulse in pulses]
