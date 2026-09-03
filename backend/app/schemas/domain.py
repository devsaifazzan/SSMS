from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Any
from datetime import date, datetime
from app.models.domain import AttendanceStatus

class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    role_id: int

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class RolePermissionBase(BaseModel):
    resource_name: str
    can_create: bool = False
    can_read: bool = False
    can_update: bool = False
    can_delete: bool = False

class RolePermissionCreate(RolePermissionBase):
    pass

class RolePermissionResponse(RolePermissionBase):
    id: int
    role_id: int
    model_config = ConfigDict(from_attributes=True)

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    permissions: List[RolePermissionCreate] = []

class RoleResponse(RoleBase):
    id: int
    permissions: List[RolePermissionResponse] = []
    model_config = ConfigDict(from_attributes=True)

class StudentProfileBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    national_id: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    medical_conditions: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    user_id: int
    enrollment_date: Optional[date] = None

class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    national_id: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    medical_conditions: Optional[str] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    enrollment_date: date
    user_id: int
    model_config = ConfigDict(from_attributes=True)

class AIStudentNoteBase(BaseModel):
    note_content: str
    insights_json: Optional[dict] = None
    requires_intervention: bool = False

class AIStudentNoteCreate(AIStudentNoteBase):
    pass

class AIStudentNoteResponse(AIStudentNoteBase):
    id: int
    student_id: int
    generated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class APIResponse(BaseModel):
    status: str
    data: Optional[Any] = None
    error: Optional[str] = None

class UserUpdate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

# --- Finance Schemas ---
class FeeTypeBase(BaseModel):
    name: str
    description: Optional[str] = None

class FeeTypeResponse(FeeTypeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class FeeStructureBase(BaseModel):
    fee_type_id: int
    class_level_id: int
    academic_year_id: int
    amount: float

class FeeStructureResponse(FeeStructureBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class StudentInvoiceBase(BaseModel):
    student_id: int
    fee_structure_id: int
    issue_date: date
    due_date: date
    amount_due: float
    status: str = "Pending"

class StudentInvoiceCreate(StudentInvoiceBase):
    pass

class StudentInvoiceResponse(StudentInvoiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PaymentBase(BaseModel):
    invoice_id: int
    amount_paid: float
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    payment_date: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Grades & Exams Schemas ---
class ExamScheduleBase(BaseModel):
    title: str
    subject_id: int
    section_id: Optional[int] = None
    exam_type_id: int
    exam_date: date
    start_time: str
    end_time: str
    max_marks: float = 100.0
    room: Optional[str] = None

class ExamScheduleCreate(ExamScheduleBase):
    pass

class ExamScheduleResponse(ExamScheduleBase):
    id: int
    subject_name: Optional[str] = None
    section_name: Optional[str] = None
    exam_type_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class MarkBase(BaseModel):
    student_id: int
    subject_id: int
    exam_type_id: int
    term_id: Optional[int] = None
    score: float
    max_score: float = 100.0

class MarkCreate(MarkBase):
    pass

class MarkResponse(MarkBase):
    id: int
    student_name: Optional[str] = None
    subject_name: Optional[str] = None
    exam_type_name: Optional[str] = None
    grade_letter: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Academics Schemas ---
class SubjectBase(BaseModel):
    name: str
    code: str

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class TeacherProfileBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    national_id: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = 0
    address: Optional[str] = None
    status: Optional[str] = "Active"

class TeacherProfileCreate(TeacherProfileBase):
    user_id: Optional[int] = None
    hire_date: Optional[date] = None

class TeacherProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    national_id: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    address: Optional[str] = None
    status: Optional[str] = None
    hire_date: Optional[date] = None

class TeacherProfileResponse(TeacherProfileBase):
    id: int
    user_id: Optional[int] = None
    hire_date: Optional[date] = None
    model_config = ConfigDict(from_attributes=True)

class ClassLevelBase(BaseModel):
    name: str

class ClassLevelCreate(ClassLevelBase):
    pass

class ClassLevelResponse(ClassLevelBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SectionBase(BaseModel):
    class_level_id: int
    name: str
    capacity: int = 30

class SectionCreate(SectionBase):
    pass

class SectionResponse(SectionBase):
    id: int
    class_level: Optional[ClassLevelResponse] = None
    model_config = ConfigDict(from_attributes=True)

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    student_id: int
    timetable_id: int
    date: date
    status: AttendanceStatus
    remarks: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AttendanceBatchCreate(BaseModel):
    timetable_id: int
    date: date
    records: List[AttendanceCreate]

# --- Promotion Schemas ---
class AcademicYearBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_active: bool = False

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearResponse(AcademicYearBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class EnrollmentBase(BaseModel):
    student_id: int
    section_id: int
    academic_year_id: int

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentResponse(EnrollmentBase):
    id: int
    student: StudentProfileResponse
    model_config = ConfigDict(from_attributes=True)

class StudentPromotionRequest(BaseModel):
    student_ids: List[int]
    to_academic_year_id: int
    to_section_id: int
