from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user_with_role
from app.models.domain import User, Attendance, AttendanceStatus, Mark, Subject, Term
from app.schemas.domain import APIResponse

router = APIRouter()

@router.get("/attendance", response_model=APIResponse)
async def get_attendance_report(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))):
    # Mocking real DB response structure for simplicity since we don't have enough daily data in DB
    attendance_data = [
      { "name": 'Mon', "Present": 95, "Absent": 5, "Late": 2 },
      { "name": 'Tue', "Present": 92, "Absent": 8, "Late": 4 },
      { "name": 'Wed', "Present": 98, "Absent": 2, "Late": 1 },
      { "name": 'Thu', "Present": 90, "Absent": 10, "Late": 5 },
      { "name": 'Fri', "Present": 85, "Absent": 15, "Late": 8 },
    ]
    return APIResponse(status="success", data=attendance_data)

@router.get("/grades", response_model=APIResponse)
async def get_grades_report(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))):
    grade_data = [
      { "name": 'Sep', "Math": 78, "Science": 82, "History": 85 },
      { "name": 'Oct', "Math": 80, "Science": 84, "History": 83 },
      { "name": 'Nov', "Math": 85, "Science": 89, "History": 86 },
      { "name": 'Dec', "Math": 82, "Science": 85, "History": 88 },
      { "name": 'Jan', "Math": 88, "Science": 92, "History": 89 },
    ]
    return APIResponse(status="success", data=grade_data)
