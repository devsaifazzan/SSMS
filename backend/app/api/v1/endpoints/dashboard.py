from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import date

from app.core.database import get_db
from app.models.domain import StudentProfile, Attendance, AttendanceStatus, AIStudentNote
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

    return APIResponse(status="success", data={
        "total_students": total_students,
        "attendance_percentage": round(attendance_percentage, 1),
        "ai_warnings": warnings
    })
