from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.dependencies import get_current_user, get_db_session
from app.models.user import User
from app.schemas.user import UserPublic
from app.schemas.workspace import WorkspaceCreate, WorkspaceDetail, WorkspaceRead
from app.services import workspace_service

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


@router.post("", response_model=WorkspaceRead, status_code=201)
async def create_workspace(
    payload: WorkspaceCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> WorkspaceRead:
    workspace = await workspace_service.create_workspace(session, payload, current_user)
    return WorkspaceRead.model_validate(workspace, from_attributes=True)


@router.get("", response_model=list[WorkspaceRead])
async def list_workspaces(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> list[WorkspaceRead]:
    workspaces = await workspace_service.list_workspaces(session, current_user)
    return [WorkspaceRead.model_validate(ws, from_attributes=True) for ws in workspaces]


@router.get("/{workspace_id}", response_model=WorkspaceDetail)
async def get_workspace(
    workspace_id: int,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
) -> WorkspaceDetail:
    workspace = await workspace_service.get_workspace_detail(session, workspace_id, current_user)
    owner = (
        UserPublic.model_validate(workspace.owner, from_attributes=True)
        if workspace.owner
        else None
    )
    members = [UserPublic.model_validate(member, from_attributes=True) for member in workspace.members]
    return WorkspaceDetail(
        id=workspace.id,
        name=workspace.name,
        description=workspace.description,
        industry=workspace.industry,
        created_at=workspace.created_at,
        owner_id=workspace.owner_id,
        owner=owner,
        members=members,
    )
