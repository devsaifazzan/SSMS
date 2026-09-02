from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.domain import Subject, TeacherProfile, ClassLevel, Section, AcademicYear, Enrollment, StudentProfile
from app.schemas.domain import (
    APIResponse, SubjectResponse, TeacherProfileResponse, ClassLevelResponse, SectionResponse,
    SubjectCreate, TeacherProfileCreate, ClassLevelCreate, SectionCreate,
    AcademicYearResponse, EnrollmentResponse, StudentPromotionRequest,
    AcademicYearCreate, EnrollmentCreate
)
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.get("/subjects", response_model=APIResponse)
async def get_subjects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Subject))
    subjects = result.scalars().all()
    return APIResponse(status="success", data=[SubjectResponse.model_validate(s) for s in subjects])

@router.post("/subjects", response_model=APIResponse)
async def create_subject(subject_in: SubjectCreate, db: AsyncSession = Depends(get_db)):
    new_subject = Subject(**subject_in.model_dump())
    db.add(new_subject)
    await db.commit()
    await db.refresh(new_subject)
    return APIResponse(status="success", data=SubjectResponse.model_validate(new_subject))

@router.get("/teachers", response_model=APIResponse)
async def get_teachers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TeacherProfile))
    teachers = result.scalars().all()
    return APIResponse(status="success", data=[TeacherProfileResponse.model_validate(t) for t in teachers])

@router.post("/teachers", response_model=APIResponse)
async def create_teacher(teacher_in: TeacherProfileCreate, db: AsyncSession = Depends(get_db)):
    dump_data = teacher_in.model_dump()
    if dump_data.get('hire_date') is None:
        del dump_data['hire_date']
    new_teacher = TeacherProfile(**dump_data)
    db.add(new_teacher)
    await db.commit()
    await db.refresh(new_teacher)
    return APIResponse(status="success", data=TeacherProfileResponse.model_validate(new_teacher))

@router.get("/class_levels", response_model=APIResponse)
async def get_class_levels(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ClassLevel))
    levels = result.scalars().all()
    return APIResponse(status="success", data=[ClassLevelResponse.model_validate(l) for l in levels])

@router.post("/class_levels", response_model=APIResponse)
async def create_class_level(level_in: ClassLevelCreate, db: AsyncSession = Depends(get_db)):
    new_level = ClassLevel(**level_in.model_dump())
    db.add(new_level)
    await db.commit()
    await db.refresh(new_level)
    return APIResponse(status="success", data=ClassLevelResponse.model_validate(new_level))

@router.get("/sections", response_model=APIResponse)
async def get_sections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Section).options(selectinload(Section.class_level)))
    sections = result.scalars().all()
    return APIResponse(status="success", data=[SectionResponse.model_validate(s) for s in sections])

@router.post("/sections", response_model=APIResponse)
async def create_section(section_in: SectionCreate, db: AsyncSession = Depends(get_db)):
    new_section = Section(**section_in.model_dump())
    db.add(new_section)
    await db.commit()
    await db.refresh(new_section)
    result = await db.execute(
        select(Section)
        .options(selectinload(Section.class_level))
        .filter(Section.id == new_section.id)
    )
    section_with_level = result.scalars().first()
    return APIResponse(status="success", data=SectionResponse.model_validate(section_with_level))

@router.get("/academic_years", response_model=APIResponse)
async def get_academic_years(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AcademicYear).order_by(AcademicYear.start_date.desc()))
    years = result.scalars().all()
    return APIResponse(status="success", data=[AcademicYearResponse.model_validate(y) for y in years])

@router.post("/academic_years", response_model=APIResponse)
async def create_academic_year(year_in: AcademicYearCreate, db: AsyncSession = Depends(get_db)):
    new_year = AcademicYear(**year_in.model_dump())
    db.add(new_year)
    await db.commit()
    await db.refresh(new_year)
    return APIResponse(status="success", data=AcademicYearResponse.model_validate(new_year))

@router.get("/enrollments", response_model=APIResponse)
async def get_enrollments(academic_year_id: int, section_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Enrollment)
        .options(selectinload(Enrollment.student))
        .filter(Enrollment.academic_year_id == academic_year_id, Enrollment.section_id == section_id)
    )
    enrollments = result.scalars().all()
    return APIResponse(status="success", data=[EnrollmentResponse.model_validate(e) for e in enrollments])

@router.post("/enrollments", response_model=APIResponse)
async def create_enrollment(enrollment_in: EnrollmentCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(Enrollment).filter(
            Enrollment.student_id == enrollment_in.student_id,
            Enrollment.academic_year_id == enrollment_in.academic_year_id
        )
    )
    if existing.scalars().first():
        return APIResponse(status="error", error="Student is already enrolled in this academic year.")
        
    new_enrollment = Enrollment(**enrollment_in.model_dump())
    db.add(new_enrollment)
    await db.commit()
    await db.refresh(new_enrollment)
    
    # We must also fetch the related student to return a full EnrollmentResponse
    result = await db.execute(
        select(Enrollment)
        .options(selectinload(Enrollment.student))
        .filter(Enrollment.id == new_enrollment.id)
    )
    enrollment_with_student = result.scalars().first()
    
    return APIResponse(status="success", data=EnrollmentResponse.model_validate(enrollment_with_student))

@router.get("/enrollments/student/{student_id}", response_model=APIResponse)
async def get_student_enrollments(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Enrollment)
        .options(selectinload(Enrollment.student))
        .filter(Enrollment.student_id == student_id)
    )
    enrollments = result.scalars().all()
    return APIResponse(status="success", data=[EnrollmentResponse.model_validate(e) for e in enrollments])

@router.post("/promote", response_model=APIResponse)
async def promote_students(req: StudentPromotionRequest, db: AsyncSession = Depends(get_db)):
    new_enrollments = []
    for student_id in req.student_ids:
        # Check if enrollment already exists to prevent duplicates
        existing = await db.execute(
            select(Enrollment).filter(
                Enrollment.student_id == student_id,
                Enrollment.academic_year_id == req.to_academic_year_id
            )
        )
        if not existing.scalars().first():
            new_enrollment = Enrollment(
                student_id=student_id,
                section_id=req.to_section_id,
                academic_year_id=req.to_academic_year_id
            )
            db.add(new_enrollment)
            new_enrollments.append(new_enrollment)
            
    await db.commit()
    return APIResponse(status="success", data={"promoted_count": len(new_enrollments)})
