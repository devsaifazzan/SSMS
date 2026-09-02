from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# This will be fully implemented when models are ready, placeholder for now
def get_current_user_with_role(required_roles: list[str] = None):
    async def current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise credentials_exception
        except Exception:
            raise credentials_exception
            
        # We need to import User model here lazily to avoid circular imports
        from app.models.domain import User, Role
        from sqlalchemy.orm import selectinload
        
        stmt = select(User).options(
            selectinload(User.role_rel).selectinload(Role.permissions)
        ).filter(User.id == int(user_id))
        result = await db.execute(stmt)
        user = result.scalars().first()
        
        if user is None:
            raise credentials_exception
            
        if required_roles and user.role not in required_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
            
        return user
    return current_user

def check_permission(resource_name: str, action: str):
    async def permission_checker(current_user = Depends(get_current_user_with_role())):
        if current_user.role == "Admin":
            return current_user # Admin has all permissions
            
        if not current_user.role_rel:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No role assigned")
            
        for perm in current_user.role_rel.permissions:
            if perm.resource_name == resource_name:
                if action == "read" and perm.can_read:
                    return current_user
                if action == "create" and perm.can_create:
                    return current_user
                if action == "update" and perm.can_update:
                    return current_user
                if action == "delete" and perm.can_delete:
                    return current_user
                    
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Not enough permissions for {action} on {resource_name}")
    return permission_checker
