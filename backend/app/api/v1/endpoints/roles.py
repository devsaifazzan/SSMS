from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_with_role, check_permission
from app.models.domain import Role, RolePermission, User
from app.schemas.domain import RoleResponse, RoleCreate, APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    result = await db.execute(select(Role).options(selectinload(Role.permissions)))
    roles = result.scalars().all()
    return APIResponse(status="success", data=[RoleResponse.model_validate(r) for r in roles])

@router.post("/", response_model=APIResponse)
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    result = await db.execute(select(Role).filter(Role.name == role_in.name))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Role name already exists")
        
    new_role = Role(
        name=role_in.name,
        description=role_in.description
    )
    
    for p in role_in.permissions:
        new_role.permissions.append(
            RolePermission(
                resource_name=p.resource_name,
                can_create=p.can_create,
                can_read=p.can_read,
                can_update=p.can_update,
                can_delete=p.can_delete
            )
        )
        
    db.add(new_role)
    await db.commit()
    await db.refresh(new_role)
    
    # Reload with permissions
    result = await db.execute(select(Role).options(selectinload(Role.permissions)).filter(Role.id == new_role.id))
    new_role = result.scalars().first()
    
    return APIResponse(status="success", data=RoleResponse.model_validate(new_role))

@router.put("/{role_id}", response_model=APIResponse)
async def update_role(
    role_id: int,
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    result = await db.execute(select(Role).options(selectinload(Role.permissions)).filter(Role.id == role_id))
    role = result.scalars().first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    if role.name == "Admin" and role_in.name != "Admin":
        raise HTTPException(status_code=400, detail="Cannot rename Admin role")
        
    role.name = role_in.name
    role.description = role_in.description
    
    # Simple strategy: delete old permissions and add new ones
    for p in role.permissions:
        await db.delete(p)
        
    for p in role_in.permissions:
        new_perm = RolePermission(
            role_id=role.id,
            resource_name=p.resource_name,
            can_create=p.can_create,
            can_read=p.can_read,
            can_update=p.can_update,
            can_delete=p.can_delete
        )
        db.add(new_perm)
        
    await db.commit()
    
    result = await db.execute(select(Role).options(selectinload(Role.permissions)).filter(Role.id == role_id))
    role = result.scalars().first()
    return APIResponse(status="success", data=RoleResponse.model_validate(role))

@router.delete("/{role_id}", response_model=APIResponse)
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    result = await db.execute(select(Role).filter(Role.id == role_id))
    role = result.scalars().first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    if role.name == "Admin":
        raise HTTPException(status_code=400, detail="Cannot delete Admin role")
        
    # Check if users are assigned to this role
    user_check = await db.execute(select(User).filter(User.role_id == role_id))
    if user_check.scalars().first():
        raise HTTPException(status_code=400, detail="Cannot delete role because it is assigned to users")
        
    await db.delete(role)
    await db.commit()
    return APIResponse(status="success", data={"message": "Role deleted successfully"})
