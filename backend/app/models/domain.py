import enum
from datetime import date, time, datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, ForeignKey, Date, Time, Text, Float, JSON, DateTime, UniqueConstraint, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Role(Base):
    __tablename__ = "roles"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    permissions: Mapped[List["RolePermission"]] = relationship(back_populates="role", cascade="all, delete-orphan")
    users: Mapped[List["User"]] = relationship(back_populates="role_rel")

class RolePermission(Base):
    __tablename__ = "role_permissions"
    id: Mapped[int] = mapped_column(primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"))
    resource_name: Mapped[str] = mapped_column(String(100), nullable=False)
    can_create: Mapped[bool] = mapped_column(Boolean, default=False)
    can_read: Mapped[bool] = mapped_column(Boolean, default=False)
    can_update: Mapped[bool] = mapped_column(Boolean, default=False)
    can_delete: Mapped[bool] = mapped_column(Boolean, default=False)
    
    role: Mapped[Role] = relationship(back_populates="permissions")
    
    __table_args__ = (UniqueConstraint('role_id', 'resource_name', name='uq_role_resource'),)

class AttendanceStatus(str, enum.Enum):
    Present = "Present"
    Absent = "Absent"
    Late = "Late"
    Excused = "Excused"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    role_rel: Mapped[Role] = relationship(back_populates="users", lazy="joined")
    student_profile: Mapped[Optional["StudentProfile"]] = relationship(back_populates="user", uselist=False)
    
    @property
    def role(self) -> str:
        return self.role_rel.name if self.role_rel else ""

class AcademicYear(Base):
    __tablename__ = "academic_years"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

class Term(Base):
    __tablename__ = "terms"
    id: Mapped[int] = mapped_column(primary_key=True)
    academic_year_id: Mapped[int] = mapped_column(ForeignKey("academic_years.id"))
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

class ClassLevel(Base):
    __tablename__ = "class_levels"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)

class Section(Base):
    __tablename__ = "sections"
    id: Mapped[int] = mapped_column(primary_key=True)
    class_level_id: Mapped[int] = mapped_column(ForeignKey("class_levels.id"))
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=30)
    
    class_level: Mapped[ClassLevel] = relationship()

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date)
    enrollment_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    blood_type: Mapped[Optional[str]] = mapped_column(String(5))
    national_id: Mapped[Optional[str]] = mapped_column(String(50), unique=True)
    address: Mapped[Optional[str]] = mapped_column(Text)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    medical_conditions: Mapped[Optional[str]] = mapped_column(Text)

    user: Mapped[User] = relationship(back_populates="student_profile")
    enrollments: Mapped[List["Enrollment"]] = relationship(back_populates="student")

class ParentProfile(Base):
    __tablename__ = "parent_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))

class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), unique=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255))
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    gender: Mapped[Optional[str]] = mapped_column(String(20))
    national_id: Mapped[Optional[str]] = mapped_column(String(50))
    specialization: Mapped[Optional[str]] = mapped_column(String(100))
    qualification: Mapped[Optional[str]] = mapped_column(String(100))
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    address: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[Optional[str]] = mapped_column(String(20), default="Active")
    hire_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())

class Enrollment(Base):
    __tablename__ = "enrollments"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    academic_year_id: Mapped[int] = mapped_column(ForeignKey("academic_years.id"))

    student: Mapped[StudentProfile] = relationship(back_populates="enrollments")
    section: Mapped[Section] = relationship()

class Subject(Base):
    __tablename__ = "subjects"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

class Timetable(Base):
    __tablename__ = "timetables"
    id: Mapped[int] = mapped_column(primary_key=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teacher_profiles.id"))
    day_of_week: Mapped[str] = mapped_column(String(10), nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    classroom: Mapped[Optional[str]] = mapped_column(String(50))

class Attendance(Base):
    __tablename__ = "attendance"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    timetable_id: Mapped[int] = mapped_column(ForeignKey("timetables.id"))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[AttendanceStatus] = mapped_column(Enum(AttendanceStatus), nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text)
    
    __table_args__ = (UniqueConstraint('student_id', 'timetable_id', 'date', name='uq_attendance'),)

class AIStudentNote(Base):
    __tablename__ = "ai_student_notes"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    generated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    note_content: Mapped[str] = mapped_column(Text, nullable=False)
    insights_json: Mapped[Optional[dict]] = mapped_column(JSON)
    requires_intervention: Mapped[bool] = mapped_column(Boolean, default=False)

class ExamType(Base):
    __tablename__ = "exam_types"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    weight_percentage: Mapped[float] = mapped_column(Float, default=100.0)

class ExamSchedule(Base):
    __tablename__ = "exam_schedules"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    section_id: Mapped[Optional[int]] = mapped_column(ForeignKey("sections.id"))
    exam_type_id: Mapped[int] = mapped_column(ForeignKey("exam_types.id"))
    exam_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[str] = mapped_column(String(20), nullable=False)
    end_time: Mapped[str] = mapped_column(String(20), nullable=False)
    max_marks: Mapped[float] = mapped_column(Float, default=100.0)
    room: Mapped[Optional[str]] = mapped_column(String(50))

    subject = relationship("Subject")
    section = relationship("Section")
    exam_type = relationship("ExamType")

class Mark(Base):
    __tablename__ = "marks"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"))
    exam_type_id: Mapped[int] = mapped_column(ForeignKey("exam_types.id"))
    term_id: Mapped[Optional[int]] = mapped_column(ForeignKey("terms.id"))
    score: Mapped[float] = mapped_column(Float, nullable=False)
    max_score: Mapped[float] = mapped_column(Float, default=100.00)

    student = relationship("StudentProfile")
    subject = relationship("Subject")
    exam_type = relationship("ExamType")


class FeeType(Base):
    __tablename__ = "fee_types"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

class FeeStructure(Base):
    __tablename__ = "fee_structures"
    id: Mapped[int] = mapped_column(primary_key=True)
    fee_type_id: Mapped[int] = mapped_column(ForeignKey("fee_types.id"))
    class_level_id: Mapped[int] = mapped_column(ForeignKey("class_levels.id"))
    academic_year_id: Mapped[int] = mapped_column(ForeignKey("academic_years.id"))
    amount: Mapped[float] = mapped_column(Float, nullable=False)

class StudentInvoice(Base):
    __tablename__ = "student_invoices"
    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"))
    fee_structure_id: Mapped[int] = mapped_column(ForeignKey("fee_structures.id"))
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount_due: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Pending")

class Payment(Base):
    __tablename__ = "payments"
    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("student_invoices.id"))
    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    payment_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    payment_method: Mapped[Optional[str]] = mapped_column(String(50))
    transaction_id: Mapped[Optional[str]] = mapped_column(String(100))

class StudentParent(Base):
    __tablename__ = "student_parent"
    student_id: Mapped[int] = mapped_column(ForeignKey("student_profiles.id"), primary_key=True)
    parent_id: Mapped[int] = mapped_column(ForeignKey("parent_profiles.id"), primary_key=True)
