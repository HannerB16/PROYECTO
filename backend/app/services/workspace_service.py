from __future__ import annotations

from fastapi import HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.links import WorkspaceUserLink
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate


async def create_workspace(
    session: AsyncSession, payload: WorkspaceCreate, owner: User
) -> Workspace:
    workspace = Workspace(
        name=payload.name,
        description=payload.description,
        industry=payload.industry,
        owner_id=owner.id,
    )
    session.add(workspace)
    await session.commit()
    await session.refresh(workspace)

    link = WorkspaceUserLink(workspace_id=workspace.id, user_id=owner.id, role="owner")
    session.add(link)
    await session.commit()
    await session.refresh(workspace, attribute_names=["members", "owner"])
    return workspace


async def list_workspaces(session: AsyncSession, user: User) -> list[Workspace]:
    query = (
        select(Workspace)
        .join(WorkspaceUserLink, WorkspaceUserLink.workspace_id == Workspace.id)
        .where(WorkspaceUserLink.user_id == user.id)
    )
    result = await session.exec(query)
    return result.all()


async def get_workspace_detail(session: AsyncSession, workspace_id: int, user: User) -> Workspace:
    workspace = await session.get(Workspace, workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Espacio de trabajo no encontrado")

    memberships = (
        await session.exec(
            select(WorkspaceUserLink).where(WorkspaceUserLink.workspace_id == workspace_id)
        )
    ).all()
    if not any(link.user_id == user.id for link in memberships):
        raise HTTPException(status_code=403, detail="No tienes acceso a este espacio")

    await session.refresh(workspace, attribute_names=["members", "owner"])
    return workspace
