from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash, get_current_user_with_role
from app.models.domain import User
from app.schemas.domain import Token, UserResponse, UserCreate, APIResponse, UserUpdate, PasswordUpdate

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter((User.username == form_data.username) | (User.email == form_data.username)))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=str(user.id))
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=APIResponse)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter((User.username == user_in.username) | (User.email == user_in.email)))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        role_id=user_in.role_id
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return APIResponse(status="success", data=UserResponse.model_validate(new_user))

@router.get("/me", response_model=APIResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user_with_role())):
    user_data = UserResponse.model_validate(current_user).model_dump()
    if current_user.role == "Admin":
        user_data["is_admin"] = True
        user_data["permissions"] = []
    else:
        user_data["is_admin"] = False
        user_data["permissions"] = [
            {
                "resource_name": p.resource_name,
                "can_read": p.can_read,
                "can_create": p.can_create,
                "can_update": p.can_update,
                "can_delete": p.can_delete
            }
            for p in (current_user.role_rel.permissions if current_user.role_rel else [])
        ]
    return APIResponse(status="success", data=user_data)

@router.put("/me", response_model=APIResponse)
async def update_current_user(user_in: UserUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role())):
    current_user.email = user_in.email
    
    if user_in.first_name or user_in.last_name:
        from app.models.domain import StudentProfile, TeacherProfile, ParentProfile
        profile_model = None
        if current_user.role == "Student":
            profile_model = StudentProfile
        elif current_user.role == "Teacher":
            profile_model = TeacherProfile
        elif current_user.role == "Parent":
            profile_model = ParentProfile
            
        if profile_model:
            result = await db.execute(select(profile_model).filter(profile_model.user_id == current_user.id))
            profile = result.scalars().first()
            if profile:
                if user_in.first_name:
                    profile.first_name = user_in.first_name
                if user_in.last_name:
                    profile.last_name = user_in.last_name

    await db.commit()
    await db.refresh(current_user)
    return APIResponse(status="success", data=UserResponse.model_validate(current_user))

@router.put("/me/password", response_model=APIResponse)
async def update_password(password_in: PasswordUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role())):
    if not verify_password(password_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = get_password_hash(password_in.new_password)
    await db.commit()
    return APIResponse(status="success", data={"message": "Password updated successfully"})
