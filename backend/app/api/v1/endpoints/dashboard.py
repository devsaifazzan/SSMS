from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from datetime import date

from app.core.database import get_db
from app.models.domain import StudentProfile, Attendance, AttendanceStatus, AIStudentNote, Payment
from app.schemas.domain import APIResponse

router = APIRouter()

@router.get("/metrics", response_model=APIResponse)
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    # Total students
    total_students_result = await db.execute(select(func.count(StudentProfile.id)))
    total_students = total_students_result.scalar() or 0

    # Today's attendance percentage
    today = date.today()
    total_attendance_today_result = await db.execute(
        select(func.count(Attendance.id)).filter(Attendance.date == today)
    )
    total_attendance_today = total_attendance_today_result.scalar() or 0
    
    present_today_result = await db.execute(
        select(func.count(Attendance.id)).filter(
            Attendance.date == today,
            Attendance.status == AttendanceStatus.Present
        )
    )
    present_today = present_today_result.scalar() or 0
    
    attendance_percentage = 0.0
    if total_attendance_today > 0:
        attendance_percentage = (present_today / total_attendance_today) * 100.0

    # Active AI warnings
    warnings_result = await db.execute(
        select(func.count(AIStudentNote.id)).filter(AIStudentNote.requires_intervention == True)
    )
    warnings = warnings_result.scalar() or 0

    # Dynamic Live Total Revenue Collected
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Payment.amount_paid), 0.0))
    )
    total_revenue = revenue_result.scalar() or 0.0

    return APIResponse(status="success", data={
        "total_students": total_students,
        "attendance_percentage": round(attendance_percentage, 1),
        "ai_warnings": warnings,
        "total_revenue": round(total_revenue, 2)
    })

@router.get("/ai-warnings", response_model=APIResponse)
async def get_ai_warnings_list(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AIStudentNote)
        .options(selectinload(AIStudentNote.student))
        .filter(AIStudentNote.requires_intervention == True)
        .order_by(AIStudentNote.created_at.desc())
    )
    notes = result.scalars().all()
    
    warnings_list = []
    for note in notes:
        student_name = f"{note.student.first_name} {note.student.last_name}" if note.student else "Unknown Student"
        warnings_list.append({
            "id": note.id,
            "student_id": note.student_id,
            "student_name": student_name,
            "note": note.note,
            "advice": note.ai_advice,
            "created_at": note.created_at.strftime("%Y-%m-%d") if note.created_at else None
        })

    return APIResponse(status="success", data=warnings_list)

