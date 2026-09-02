import asyncio
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.domain import StudentProfile, Subject, ExamType, Term, Mark, AcademicYear
from datetime import date
import random

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Create some basic structural data if missing
        academic_year = await db.scalar(select(AcademicYear).limit(1))
        if not academic_year:
            academic_year = AcademicYear(name="2026-2027", start_date=date(2026, 9, 1), end_date=date(2027, 6, 30), is_active=True)
            db.add(academic_year)
            await db.commit()
            await db.refresh(academic_year)

        term = await db.scalar(select(Term).limit(1))
        if not term:
            term = Term(academic_year_id=academic_year.id, name="Term 1", start_date=date(2026, 9, 1), end_date=date(2026, 12, 15))
            db.add(term)
            await db.commit()
            await db.refresh(term)

        exam_type = await db.scalar(select(ExamType).limit(1))
        if not exam_type:
            exam_type = ExamType(name="Midterm", weight_percentage=30.0)
            db.add(exam_type)
            await db.commit()
            await db.refresh(exam_type)

        # Get subjects
        result = await db.execute(select(Subject))
        subjects = result.scalars().all()
        if not subjects:
            subjects = [
                Subject(name="Mathematics", code="MATH101"),
                Subject(name="Science", code="SCI101"),
                Subject(name="History", code="HIST101")
            ]
            db.add_all(subjects)
            await db.commit()
            for s in subjects:
                await db.refresh(s)

        # Get students
        result = await db.execute(select(StudentProfile))
        students = result.scalars().all()

        if not students:
            print("No students found. Add some students first to assign grades.")
            return

        # Seed marks
        marks_to_add = []
        for student in students:
            for subject in subjects:
                # generate random grade 60-100
                score = round(random.uniform(60, 100), 2)
                marks_to_add.append(
                    Mark(
                        student_id=student.id,
                        subject_id=subject.id,
                        exam_type_id=exam_type.id,
                        term_id=term.id,
                        score=score,
                        max_score=100.0
                    )
                )

        db.add_all(marks_to_add)
        await db.commit()
        print(f"Seeded {len(marks_to_add)} marks for {len(students)} students.")

if __name__ == "__main__":
    asyncio.run(seed_data())
