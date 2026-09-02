from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.models.domain import Mark, ExamSchedule, ExamType, Subject, Section, StudentProfile
from app.schemas.domain import (
    APIResponse, MarkCreate, MarkResponse, 
    ExamScheduleCreate, ExamScheduleResponse
)

router = APIRouter()

def calculate_grade_letter(score: float, max_score: float) -> str:
    if max_score <= 0:
        return "F"
    percentage = (score / max_score) * 100.0
    if percentage >= 95:
        return "A+"
    elif percentage >= 90:
        return "A"
    elif percentage >= 85:
        return "B+"
    elif percentage >= 80:
        return "B"
    elif percentage >= 75:
        return "C+"
    elif percentage >= 70:
        return "C"
    elif percentage >= 60:
        return "D"
    else:
        return "F"

@router.get("/", response_model=APIResponse)
async def get_grades(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Mark)
        .options(
            selectinload(Mark.student),
            selectinload(Mark.subject),
            selectinload(Mark.exam_type)
        )
    )
    marks = result.scalars().all()
    
    response_data = []
    for m in marks:
        student_name = f"{m.student.first_name} {m.student.last_name}" if m.student else f"Student #{m.student_id}"
        subject_name = m.subject.name if m.subject else f"Subject #{m.subject_id}"
        exam_type_name = m.exam_type.name if m.exam_type else "Exam"
        grade_letter = calculate_grade_letter(m.score, m.max_score)
        
        response_data.append({
            "id": m.id,
            "student_id": m.student_id,
            "subject_id": m.subject_id,
            "exam_type_id": m.exam_type_id,
            "term_id": m.term_id,
            "score": m.score,
            "max_score": m.max_score,
            "student_name": student_name,
            "subject_name": subject_name,
            "exam_type_name": exam_type_name,
            "grade_letter": grade_letter
        })
        
    return APIResponse(status="success", data=response_data)

@router.post("/", response_model=APIResponse)
async def add_grade(mark_in: MarkCreate, db: AsyncSession = Depends(get_db)):
    new_mark = Mark(**mark_in.model_dump())
    db.add(new_mark)
    await db.commit()
    await db.refresh(new_mark)
    return APIResponse(status="success", data=MarkResponse.model_validate(new_mark))

@router.get("/exams", response_model=APIResponse)
async def get_exam_schedules(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExamSchedule)
        .options(
            selectinload(ExamSchedule.subject),
            selectinload(ExamSchedule.section),
            selectinload(ExamSchedule.exam_type)
        )
        .order_by(ExamSchedule.exam_date.asc())
    )
    exams = result.scalars().all()
    
    response_data = []
    for e in exams:
        subject_name = e.subject.name if e.subject else f"Subject #{e.subject_id}"
        section_name = e.section.name if e.section else "All Sections"
        exam_type_name = e.exam_type.name if e.exam_type else "Exam"
        
        response_data.append({
            "id": e.id,
            "title": e.title,
            "subject_id": e.subject_id,
            "section_id": e.section_id,
            "exam_type_id": e.exam_type_id,
            "exam_date": e.exam_date.strftime("%Y-%m-%d") if e.exam_date else "",
            "start_time": e.start_time,
            "end_time": e.end_time,
            "max_marks": e.max_marks,
            "room": e.room or "Main Hall",
            "subject_name": subject_name,
            "section_name": section_name,
            "exam_type_name": exam_type_name
        })
        
    return APIResponse(status="success", data=response_data)

@router.post("/exams", response_model=APIResponse)
async def create_exam_schedule(exam_in: ExamScheduleCreate, db: AsyncSession = Depends(get_db)):
    new_exam = ExamSchedule(**exam_in.model_dump())
    db.add(new_exam)
    await db.commit()
    await db.refresh(new_exam)
    return APIResponse(status="success", data=ExamScheduleResponse.model_validate(new_exam))

@router.get("/exam-types", response_model=APIResponse)
async def get_exam_types(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExamType))
    types = result.scalars().all()
    
    # If no exam types in DB, seed default exam types
    if not types:
        defaults = [
            ExamType(name="Midterm Exam", weight_percentage=30.0),
            ExamType(name="Final Exam", weight_percentage=50.0),
            ExamType(name="Quiz", weight_percentage=10.0),
            ExamType(name="Assignment", weight_percentage=10.0)
        ]
        for d in defaults:
            db.add(d)
        await db.commit()
        result = await db.execute(select(ExamType))
        types = result.scalars().all()
        
    return APIResponse(status="success", data=[{"id": t.id, "name": t.name, "weight_percentage": t.weight_percentage} for t in types])

