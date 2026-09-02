from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user_with_role
from app.models.domain import StudentProfile, User
from app.schemas.domain import StudentProfileResponse, StudentProfileCreate, StudentProfileUpdate, APIResponse
from app.services.ai_service import generate_student_insights

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_students(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))):
    result = await db.execute(select(StudentProfile).offset(skip).limit(limit))
    students = result.scalars().all()
    return APIResponse(status="success", data=[StudentProfileResponse.model_validate(s) for s in students])

@router.post("/", response_model=APIResponse)
async def create_student(student_in: StudentProfileCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal"]))):
    new_student = StudentProfile(**student_in.model_dump())
    db.add(new_student)
    await db.commit()
    await db.refresh(new_student)
    return APIResponse(status="success", data=StudentProfileResponse.model_validate(new_student))

@router.get("/{student_id}", response_model=APIResponse)
async def get_student(student_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))):
    result = await db.execute(select(StudentProfile).filter(StudentProfile.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return APIResponse(status="success", data=StudentProfileResponse.model_validate(student))

@router.post("/{student_id}/ai-insights", response_model=APIResponse)
async def generate_insights(student_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))):
    result = await db.execute(select(StudentProfile).filter(StudentProfile.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Generate insights using AI service
    note = await generate_student_insights(db, student_id)
    return APIResponse(status="success", data=note)

@router.put("/{student_id}", response_model=APIResponse)
async def update_student(student_id: int, student_in: StudentProfileUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal"]))):
    result = await db.execute(select(StudentProfile).filter(StudentProfile.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
        
    await db.commit()
    await db.refresh(student)
    return APIResponse(status="success", data=StudentProfileResponse.model_validate(student))

@router.delete("/{student_id}", response_model=APIResponse)
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal"]))):
    result = await db.execute(select(StudentProfile).filter(StudentProfile.id == student_id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    await db.delete(student)
    await db.commit()
    return APIResponse(status="success", data={"message": "Student deleted successfully"})
