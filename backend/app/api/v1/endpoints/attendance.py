from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import date

from app.core.database import get_db
from app.core.security import get_current_user_with_role
from app.models.domain import Attendance, User, AttendanceStatus
from app.schemas.domain import APIResponse, AttendanceBatchCreate, AttendanceResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_attendance(
    timetable_id: int, 
    filter_date: date, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))
):
    result = await db.execute(
        select(Attendance).where(
            Attendance.timetable_id == timetable_id,
            Attendance.date == filter_date
        )
    )
    records = result.scalars().all()
    return APIResponse(status="success", data=[AttendanceResponse.model_validate(r) for r in records])

@router.post("/batch", response_model=APIResponse)
async def batch_create_attendance(
    batch_data: AttendanceBatchCreate, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))
):
    # Fetch existing records for this timetable_id and date
    result = await db.execute(
        select(Attendance).where(
            Attendance.timetable_id == batch_data.timetable_id,
            Attendance.date == batch_data.date
        )
    )
    existing_records = {r.student_id: r for r in result.scalars().all()}
    
    for record_in in batch_data.records:
        if record_in.student_id in existing_records:
            # Update existing
            existing = existing_records[record_in.student_id]
            existing.status = record_in.status
            existing.remarks = record_in.remarks
        else:
            # Create new
            new_record = Attendance(
                student_id=record_in.student_id,
                timetable_id=record_in.timetable_id,
                date=record_in.date,
                status=record_in.status,
                remarks=record_in.remarks
            )
            db.add(new_record)
            
    await db.commit()
    return APIResponse(status="success", data={"message": f"Processed {len(batch_data.records)} attendance records."})
