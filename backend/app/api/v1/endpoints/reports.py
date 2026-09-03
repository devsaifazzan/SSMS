from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user_with_role
from app.models.domain import User, StudentProfile, TeacherProfile, Attendance, Mark, Subject, ClassLevel, Section, Enrollment, StudentInvoice, Payment
from app.schemas.domain import APIResponse

router = APIRouter()

@router.get("/students", response_model=APIResponse)
async def get_students_report(
    class_level_id: Optional[int] = Query(None),
    section_id: Optional[int] = Query(None),
    gender: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))
):
    # Fetch real students from DB
    stmt = select(StudentProfile)
    result = await db.execute(stmt)
    db_students = result.scalars().all()

    # Pre-defined mock data combined with real DB data if available
    mock_students_list = [
        {"id": 101, "first_name": "أحمد", "last_name": "محمود الإبراهيم", "gender": "Male", "class_name": "الصف الأول الثانوي", "section_name": "شعبة أ", "attendance_pct": 96.5, "gpa": 92.4, "status": "Active", "national_id": "109847281", "enrollment_date": "2024-09-01"},
        {"id": 102, "first_name": "سارة", "last_name": "عبد الله العتيبي", "gender": "Female", "class_name": "الصف الأول الثانوي", "section_name": "شعبة أ", "attendance_pct": 98.0, "gpa": 95.8, "status": "Active", "national_id": "109847282", "enrollment_date": "2024-09-01"},
        {"id": 103, "first_name": "محمد", "last_name": "علي الشمري", "gender": "Male", "class_name": "الصف الأول الثانوي", "section_name": "شعبة ب", "attendance_pct": 84.0, "gpa": 71.2, "status": "At Risk", "national_id": "109847283", "enrollment_date": "2024-09-01"},
        {"id": 104, "first_name": "فاطمة", "last_name": "حسن الشهري", "gender": "Female", "class_name": "الصف الثاني الثانوي", "section_name": "شعبة أ", "attendance_pct": 91.2, "gpa": 88.5, "status": "Active", "national_id": "109847284", "enrollment_date": "2023-09-01"},
        {"id": 105, "first_name": "خالد", "last_name": "سعد الدوسري", "gender": "Male", "class_name": "الصف الثاني الثانوي", "section_name": "شعبة ب", "attendance_pct": 78.5, "gpa": 64.0, "status": "At Risk", "national_id": "109847285", "enrollment_date": "2023-09-01"},
        {"id": 106, "first_name": "ريم", "last_name": "عمر القحطاني", "gender": "Female", "class_name": "الصف الثالث الثانوي", "section_name": "شعبة أ", "attendance_pct": 99.1, "gpa": 98.2, "status": "Active", "national_id": "109847286", "enrollment_date": "2022-09-01"},
        {"id": 107, "first_name": "عمر", "last_name": "إبراهيم الحربي", "gender": "Male", "class_name": "الصف الثالث الثانوي", "section_name": "شعبة ب", "attendance_pct": 93.0, "gpa": 85.0, "status": "Active", "national_id": "109847287", "enrollment_date": "2022-09-01"},
        {"id": 108, "first_name": "نورة", "last_name": "فهد المطيري", "gender": "Female", "class_name": "الصف الأول الثانوي", "section_name": "شعبة ب", "attendance_pct": 89.0, "gpa": 79.4, "status": "Active", "national_id": "109847288", "enrollment_date": "2024-09-01"},
    ]

    # Include real database students
    for idx, s in enumerate(db_students):
        mock_students_list.append({
            "id": s.id,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "gender": s.gender or ("Male" if idx % 2 == 0 else "Female"),
            "class_name": "الصف الأول الثانوي" if idx % 2 == 0 else "الصف الثاني الثانوي",
            "section_name": "شعبة أ" if idx % 2 == 0 else "شعبة ب",
            "attendance_pct": 90.0 + (idx % 10),
            "gpa": 75.0 + (idx * 3 % 25),
            "status": "Active" if (75 + (idx * 3 % 25)) >= 70 else "At Risk",
            "national_id": s.national_id or f"1000000{s.id}",
            "enrollment_date": str(s.enrollment_date) if s.enrollment_date else "2024-09-01"
        })

    # Apply filters
    filtered_list = mock_students_list
    if gender and gender.lower() != 'all':
        filtered_list = [s for s in filtered_list if s["gender"].lower() == gender.lower()]

    if status and status.lower() != 'all':
        filtered_list = [s for s in filtered_list if s["status"].lower() == status.lower()]

    if search:
        search_lower = search.lower()
        filtered_list = [
            s for s in filtered_list
            if search_lower in f"{s['first_name']} {s['last_name']}".lower() or search_lower in str(s['national_id']).lower()
        ]

    # Summaries
    total_students = len(filtered_list)
    male_count = sum(1 for s in filtered_list if s["gender"] == "Male")
    female_count = sum(1 for s in filtered_list if s["gender"] == "Female")
    avg_attendance = round(sum(s["attendance_pct"] for s in filtered_list) / total_students, 1) if total_students > 0 else 0
    avg_gpa = round(sum(s["gpa"] for s in filtered_list) / total_students, 1) if total_students > 0 else 0
    at_risk_count = sum(1 for s in filtered_list if s["status"] == "At Risk")

    # Distributions
    class_distribution = [
        {"name": "الصف الأول الثانوي", "count": sum(1 for s in filtered_list if "الأول" in s["class_name"])},
        {"name": "الصف الثاني الثانوي", "count": sum(1 for s in filtered_list if "الثاني" in s["class_name"])},
        {"name": "الصف الثالث الثانوي", "count": sum(1 for s in filtered_list if "الثالث" in s["class_name"])},
    ]

    gender_distribution = [
        {"name": "ذكور", "value": male_count, "fill": "#3b82f6"},
        {"name": "إناث", "value": female_count, "fill": "#ec4899"}
    ]

    performance_distribution = [
        {"bracket": "ممتاز (90-100%)", "count": sum(1 for s in filtered_list if s["gpa"] >= 90)},
        {"bracket": "جيد جداً (80-89%)", "count": sum(1 for s in filtered_list if 80 <= s["gpa"] < 90)},
        {"bracket": "جيد (70-79%)", "count": sum(1 for s in filtered_list if 70 <= s["gpa"] < 80)},
        {"bracket": "مقبول/ضعيف (<70%)", "count": sum(1 for s in filtered_list if s["gpa"] < 70)},
    ]

    return APIResponse(
        status="success",
        data={
            "summary": {
                "total_students": total_students,
                "male_count": male_count,
                "female_count": female_count,
                "avg_attendance": avg_attendance,
                "avg_gpa": avg_gpa,
                "at_risk_count": at_risk_count
            },
            "class_distribution": class_distribution,
            "gender_distribution": gender_distribution,
            "performance_distribution": performance_distribution,
            "students": filtered_list,
            "at_risk_students": [s for s in filtered_list if s["status"] == "At Risk"]
        }
    )


@router.get("/teachers", response_model=APIResponse)
async def get_teachers_report(
    specialization: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    qualification: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))
):
    stmt = select(TeacherProfile)
    result = await db.execute(stmt)
    db_teachers = result.scalars().all()

    mock_teachers_list = [
        {"id": 1, "first_name": "د. عبد الرحمن", "last_name": "الغامدي", "email": "a.ghamdi@school.edu", "phone_number": "0501234567", "specialization": "الرياضيات", "qualification": "دكتوراه", "experience_years": 12, "status": "Active", "assigned_classes": 6, "weekly_hours": 24, "hire_date": "2018-09-01"},
        {"id": 2, "first_name": "أ. منيرة", "last_name": "الزهراني", "email": "m.zahrani@school.edu", "phone_number": "0502345678", "specialization": "العلوم العامة", "qualification": "ماجستير", "experience_years": 8, "status": "Active", "assigned_classes": 5, "weekly_hours": 20, "hire_date": "2020-01-15"},
        {"id": 3, "first_name": "أ. طارق", "last_name": "المنصور", "email": "t.mansour@school.edu", "phone_number": "0503456789", "specialization": "اللغة الإنجليزية", "qualification": "بكالوريوس", "experience_years": 5, "status": "Active", "assigned_classes": 4, "weekly_hours": 18, "hire_date": "2021-08-20"},
        {"id": 4, "first_name": "د. هدى", "last_name": "المالكي", "email": "h.malki@school.edu", "phone_number": "0504567890", "specialization": "الفيزياء", "qualification": "دكتوراه", "experience_years": 10, "status": "Active", "assigned_classes": 4, "weekly_hours": 16, "hire_date": "2019-09-01"},
        {"id": 5, "first_name": "أ. ياسر", "last_name": "العتيبي", "email": "y.otaibi@school.edu", "phone_number": "0505678901", "specialization": "الحاسب الآلي", "qualification": "بكالوريوس", "experience_years": 3, "status": "Active", "assigned_classes": 6, "weekly_hours": 22, "hire_date": "2023-01-10"},
        {"id": 6, "first_name": "أ. أسماء", "last_name": "السبيعي", "email": "a.subaie@school.edu", "phone_number": "0506789012", "specialization": "اللغة العربية", "qualification": "ماجستير", "experience_years": 7, "status": "On Leave", "assigned_classes": 3, "weekly_hours": 12, "hire_date": "2021-09-01"},
    ]

    for idx, t in enumerate(db_teachers):
        mock_teachers_list.append({
            "id": t.id,
            "first_name": t.first_name,
            "last_name": t.last_name,
            "email": t.email or f"teacher{t.id}@ssms.edu",
            "phone_number": t.phone_number or "0500000000",
            "specialization": t.specialization or ("الرياضيات" if idx % 2 == 0 else "العلوم"),
            "qualification": t.qualification or "بكالوريوس",
            "experience_years": t.experience_years or (idx + 2),
            "status": t.status or "Active",
            "assigned_classes": 4 + (idx % 3),
            "weekly_hours": 16 + (idx % 8),
            "hire_date": str(t.hire_date) if t.hire_date else "2022-09-01"
        })

    filtered_list = mock_teachers_list

    if specialization and specialization.lower() != 'all':
        filtered_list = [t for t in filtered_list if specialization.lower() in t["specialization"].lower()]

    if status and status.lower() != 'all':
        filtered_list = [t for t in filtered_list if t["status"].lower() == status.lower()]

    if qualification and qualification.lower() != 'all':
        filtered_list = [t for t in filtered_list if qualification.lower() in t["qualification"].lower()]

    if search:
        search_lower = search.lower()
        filtered_list = [
            t for t in filtered_list
            if search_lower in f"{t['first_name']} {t['last_name']}".lower()
            or search_lower in t["specialization"].lower()
            or search_lower in t["email"].lower()
        ]

    total_teachers = len(filtered_list)
    active_teachers = sum(1 for t in filtered_list if t["status"] == "Active")
    avg_experience = round(sum(t["experience_years"] for t in filtered_list) / total_teachers, 1) if total_teachers > 0 else 0
    total_assigned_hours = sum(t["weekly_hours"] for t in filtered_list)

    spec_counts = {}
    for t in filtered_list:
        spec = t["specialization"]
        spec_counts[spec] = spec_counts.get(spec, 0) + 1
    specialization_distribution = [{"name": k, "count": v} for k, v in spec_counts.items()]

    qual_counts = {}
    for t in filtered_list:
        q = t["qualification"]
        qual_counts[q] = qual_counts.get(q, 0) + 1
    qualification_distribution = [{"name": k, "count": v} for k, v in qual_counts.items()]

    experience_distribution = [
        {"bracket": "1-3 سنوات", "count": sum(1 for t in filtered_list if 1 <= t["experience_years"] <= 3)},
        {"bracket": "4-7 سنوات", "count": sum(1 for t in filtered_list if 4 <= t["experience_years"] <= 7)},
        {"bracket": "8-10 سنوات", "count": sum(1 for t in filtered_list if 8 <= t["experience_years"] <= 10)},
        {"bracket": "أكثر من 10 سنوات", "count": sum(1 for t in filtered_list if t["experience_years"] > 10)},
    ]

    return APIResponse(
        status="success",
        data={
            "summary": {
                "total_teachers": total_teachers,
                "active_teachers": active_teachers,
                "avg_experience": avg_experience,
                "total_weekly_hours": total_assigned_hours,
                "top_specialization": max(spec_counts, key=spec_counts.get) if spec_counts else "الرياضيات"
            },
            "specialization_distribution": specialization_distribution,
            "qualification_distribution": qualification_distribution,
            "experience_distribution": experience_distribution,
            "teachers": filtered_list
        }
    )


@router.get("/attendance", response_model=APIResponse)
async def get_attendance_report(
    period: Optional[str] = Query("week"),
    class_level_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))
):
    attendance_trend = [
        { "name": 'الأحد', "Present": 96, "Absent": 4, "Late": 2, "Excused": 1 },
        { "name": 'الإثنين', "Present": 94, "Absent": 6, "Late": 3, "Excused": 2 },
        { "name": 'الثلاثاء', "Present": 98, "Absent": 2, "Late": 1, "Excused": 0 },
        { "name": 'الأربعاء', "Present": 91, "Absent": 9, "Late": 4, "Excused": 3 },
        { "name": 'الخميس', "Present": 88, "Absent": 12, "Late": 6, "Excused": 2 },
    ]

    status_pie = [
        {"name": "حضور", "value": 467, "fill": "#10b981"},
        {"name": "غياب", "value": 33, "fill": "#ef4444"},
        {"name": "تأخير", "value": 16, "fill": "#f59e0b"},
        {"name": "عذر مقبول", "value": 8, "fill": "#3b82f6"}
    ]

    return APIResponse(
        status="success",
        data={
            "attendance_trend": attendance_trend,
            "status_distribution": status_pie,
            "summary": {
                "overall_attendance_pct": 93.4,
                "total_recorded_sessions": 524,
                "absent_count": 33,
                "late_count": 16
            }
        }
    )


@router.get("/grades", response_model=APIResponse)
async def get_grades_report(
    subject_id: Optional[int] = Query(None),
    class_level_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin", "Principal", "Teacher"]))
):
    grade_trend = [
        { "name": 'الشهر 1', "الرياضيات": 78, "العلوم": 82, "اللغة العربية": 85, "الإنجليزي": 80 },
        { "name": 'الشهر 2', "الرياضيات": 81, "العلوم": 84, "اللغة العربية": 83, "الإنجليزي": 83 },
        { "name": 'الشهر 3', "الرياضيات": 85, "العلوم": 89, "اللغة العربية": 86, "الإنجليزي": 87 },
        { "name": 'الشهر 4', "الرياضيات": 83, "العلوم": 86, "اللغة العربية": 88, "الإنجليزي": 85 },
        { "name": 'النهائي', "الرياضيات": 88, "العلوم": 92, "اللغة العربية": 89, "الإنجليزي": 90 },
    ]

    subject_averages = [
        {"subject": "العلوم العامة", "avg": 86.6, "pass_rate": 96.0},
        {"subject": "اللغة الإنجليزية", "avg": 85.0, "pass_rate": 94.2},
        {"subject": "اللغة العربية", "avg": 86.2, "pass_rate": 98.0},
        {"subject": "الرياضيات", "avg": 83.0, "pass_rate": 89.5},
        {"subject": "الفيزياء", "avg": 81.4, "pass_rate": 87.0},
    ]

    return APIResponse(
        status="success",
        data={
            "grade_trend": grade_trend,
            "subject_averages": subject_averages,
            "summary": {
                "overall_gpa": 85.2,
                "highest_performing_subject": "العلوم العامة",
                "total_exams_recorded": 142,
                "pass_rate_overall": 93.8
            }
        }
    )


@router.get("/finance", response_model=APIResponse)
async def get_finance_report(
    status: Optional[str] = Query(None),
    class_level_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_role(["Admin", "Principal"]))
):
    monthly_revenue = [
        {"month": "سبتمبر", "collected": 120000, "pending": 15000},
        {"month": "أكتوبر", "collected": 95000, "pending": 20000},
        {"month": "نوفمبر", "collected": 110000, "pending": 10000},
        {"month": "ديسمبر", "collected": 85000, "pending": 30000},
        {"month": "يناير", "collected": 130000, "pending": 5000},
    ]

    payment_status = [
        {"name": "تم السداد بالكامل", "value": 340, "amount": 420000, "fill": "#10b981"},
        {"name": "سداد جزئي / معلق", "value": 45, "amount": 65000, "fill": "#f59e0b"},
        {"name": "متأخرات غير مسددة", "value": 15, "amount": 25000, "fill": "#ef4444"}
    ]

    return APIResponse(
        status="success",
        data={
            "monthly_revenue": monthly_revenue,
            "payment_status": payment_status,
            "summary": {
                "total_invoiced": 510000,
                "total_collected": 420000,
                "total_pending": 65000,
                "total_overdue": 25000,
                "collection_rate_pct": 82.4
            }
        }
    )

