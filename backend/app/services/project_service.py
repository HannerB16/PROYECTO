from __future__ import annotations

from fastapi import HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.links import WorkspaceUserLink
from app.models.project import Project, ProjectPulse
from app.models.workspace import Workspace
from app.schemas.project import ProjectCreate


async def create_project(session: AsyncSession, payload: ProjectCreate, user_id: int) -> Project:
    workspace = await session.get(Workspace, payload.workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Espacio de trabajo no encontrado")
    if workspace.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Solo el owner puede crear proyectos")

    project = Project(**payload.model_dump())
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


async def list_projects(session: AsyncSession, workspace_id: int, user_id: int) -> list[Project]:
    await _ensure_membership(session, workspace_id, user_id)
    query = select(Project).where(Project.workspace_id == workspace_id)
    result = await session.exec(query)
    return result.all()


async def get_project_pulses(session: AsyncSession, project_id: int, user_id: int) -> list[ProjectPulse]:
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    await _ensure_membership(session, project.workspace_id, user_id)
    query = select(ProjectPulse).where(ProjectPulse.project_id == project_id)
    result = await session.exec(query)
    return result.all()


async def _ensure_membership(session: AsyncSession, workspace_id: int, user_id: int) -> None:
    membership = await session.exec(
        select(WorkspaceUserLink).where(
            WorkspaceUserLink.workspace_id == workspace_id,
            WorkspaceUserLink.user_id == user_id,
        )
    )
    if not membership.first():
        raise HTTPException(status_code=403, detail="Acceso no autorizado a este workspace")
