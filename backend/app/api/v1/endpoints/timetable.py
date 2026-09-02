from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.core.database import get_db
from app.models.domain import Timetable, Subject, TeacherProfile, Section
from app.schemas.timetable import TimetableCreate, TimetableResponse, TimetableDetailResponse
from app.schemas.domain import APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_timetables(
    section_id: Optional[int] = Query(None, description="Filter by Section ID"),
    teacher_id: Optional[int] = Query(None, description="Filter by Teacher ID"),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Timetable)
        .options(
            selectinload(Timetable.section),
            selectinload(Timetable.subject),
            selectinload(Timetable.teacher)
        )
    )
    
    if section_id is not None:
        query = query.filter(Timetable.section_id == section_id)
    if teacher_id is not None:
        query = query.filter(Timetable.teacher_id == teacher_id)
        
    result = await db.execute(query)
    timetables = result.scalars().all()
    
    response_data = []
    for t in timetables:
        sec_name = t.section.name if t.section else f"Section #{t.section_id}"
        sub_name = t.subject.name if t.subject else f"Subject #{t.subject_id}"
        teach_name = f"{t.teacher.first_name} {t.teacher.last_name}" if t.teacher else f"Teacher #{t.teacher_id}"
        
        response_data.append({
            "id": t.id,
            "section_id": t.section_id,
            "subject_id": t.subject_id,
            "teacher_id": t.teacher_id,
            "day_of_week": t.day_of_week,
            "start_time": t.start_time.strftime("%H:%M:%S") if hasattr(t.start_time, "strftime") else str(t.start_time),
            "end_time": t.end_time.strftime("%H:%M:%S") if hasattr(t.end_time, "strftime") else str(t.end_time),
            "classroom": t.classroom or "Room 101",
            "section_name": sec_name,
            "subject_name": sub_name,
            "teacher_name": teach_name
        })
    
    return APIResponse(status="success", data=response_data)

@router.post("/", response_model=APIResponse)
async def create_timetable(timetable_in: TimetableCreate, db: AsyncSession = Depends(get_db)):
    new_timetable = Timetable(**timetable_in.model_dump())
    db.add(new_timetable)
    await db.commit()
    await db.refresh(new_timetable)
    return APIResponse(status="success", data=TimetableResponse.model_validate(new_timetable))

