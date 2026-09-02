from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import get_current_user_with_role, get_password_hash
from app.models.domain import User, Role
from app.schemas.domain import UserResponse, UserCreate, APIResponse

router = APIRouter()

class UserAdminUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

@router.get("/", response_model=APIResponse)
async def get_all_users(
    skip: int = 0, 
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return APIResponse(
        status="success", 
        data=[UserResponse.model_validate(u) for u in users]
    )

@router.post("/", response_model=APIResponse)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    result = await db.execute(select(User).filter((User.username == user_in.username) | (User.email == user_in.email)))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        role_id=user_in.role_id,
        is_active=user_in.is_active
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return APIResponse(status="success", data=UserResponse.model_validate(new_user))

@router.put("/{user_id}", response_model=APIResponse)
async def update_user(
    user_id: int,
    user_in: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_in.username is not None:
        user.username = user_in.username
    if user_in.email is not None:
        user.email = user_in.email
    if user_in.role_id is not None:
        user.role_id = user_in.role_id
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)
        
    await db.commit()
    await db.refresh(user)
    return APIResponse(status="success", data=UserResponse.model_validate(user))

@router.delete("/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin"]))
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
        
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await db.delete(user)
    await db.commit()
    return APIResponse(status="success", data={"message": "User deleted successfully"})
