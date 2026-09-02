from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import time

class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    model_config = ConfigDict(from_attributes=True)

class SectionResponse(BaseModel):
    id: int
    name: str
    capacity: int
    model_config = ConfigDict(from_attributes=True)

class TeacherProfileResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    model_config = ConfigDict(from_attributes=True)

class TimetableBase(BaseModel):
    section_id: int
    subject_id: int
    teacher_id: int
    day_of_week: str
    start_time: time
    end_time: time
    classroom: Optional[str] = None

class TimetableCreate(TimetableBase):
    pass

class TimetableResponse(TimetableBase):
    id: int
    section_name: Optional[str] = None
    subject_name: Optional[str] = None
    teacher_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class TimetableDetailResponse(TimetableResponse):
    subject: Optional[SubjectResponse] = None
    teacher: Optional[TeacherProfileResponse] = None
    section: Optional[SectionResponse] = None
    model_config = ConfigDict(from_attributes=True)
