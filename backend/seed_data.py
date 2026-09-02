import asyncio
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.domain import (
    User, Role, RolePermission, StudentProfile, TeacherProfile, ClassLevel, Section, Subject, Timetable
)
# A simple hasher if auth doesn't provide one directly, or just use passlib directly.
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Create Roles
        admin_role = Role(name="Admin", description="System Administrator")
        teacher_role = Role(name="Teacher", description="Teaching Staff")
        student_role = Role(name="Student", description="Enrolled Student")
        
        db.add_all([admin_role, teacher_role, student_role])
        await db.commit()
        
        # Create admin user
        admin = User(
            username="admin", 
            email="admin@ssms.edu", 
            hashed_password=get_password_hash("admin123"), 
            role_id=admin_role.id
        )
        db.add(admin)
        
        # Create Teacher
        teacher_user = User(
            username="teacher1",
            email="teacher1@ssms.edu",
            hashed_password=get_password_hash("teacher123"),
            role_id=teacher_role.id
        )
        db.add(teacher_user)
        
        # Create Students
        students_data = [
            ("Alice", "Johnson", "alice@ssms.edu", "alice123"),
            ("Bob", "Smith", "bob@ssms.edu", "bob123"),
            ("Charlie", "Davis", "charlie@ssms.edu", "charlie123"),
            ("Diana", "Prince", "diana@ssms.edu", "diana123"),
            ("Evan", "Wright", "evan@ssms.edu", "evan123"),
        ]
        
        student_users = []
        for first, last, email, pwd in students_data:
            user = User(
                username=first.lower(),
                email=email,
                hashed_password=get_password_hash(pwd),
                role_id=student_role.id
            )
            db.add(user)
            student_users.append((user, first, last))
            
        await db.commit()
        
        # Reload users to get IDs
        # Create teacher profile
        teacher_profile = TeacherProfile(
            user_id=teacher_user.id,
            first_name="John",
            last_name="Doe",
            hire_date=datetime.date(2020, 8, 15)
        )
        db.add(teacher_profile)
        
        # Create student profiles
        for user, first, last in student_users:
            profile = StudentProfile(
                user_id=user.id,
                first_name=first,
                last_name=last,
                date_of_birth=datetime.date(2005, 5, 12),
                enrollment_date=datetime.date(2022, 9, 1)
            )
            db.add(profile)
            
        # Create ClassLevel and Section
        cl = ClassLevel(name="Grade 10")
        db.add(cl)
        await db.commit()
        
        sec = Section(class_level_id=cl.id, name="10-A", capacity=30)
        db.add(sec)
        await db.commit()
        
        # Create Subject
        sub = Subject(name="Mathematics", code="MATH101")
        db.add(sub)
        await db.commit()
        
        # Create Timetable
        tt = Timetable(
            section_id=sec.id,
            subject_id=sub.id,
            teacher_id=teacher_profile.id,
            day_of_week="Monday",
            start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
            classroom="Room 101"
        )
        db.add(tt)
        await db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
