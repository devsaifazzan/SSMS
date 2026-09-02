from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, students, timetable, dashboard, reports, finance, grades, academics, users, roles, attendance
from app.core.config import settings

app = FastAPI(
    title="Smart School Management System (SSMS)",
    description="API for the Smart School Management System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development. Configure properly for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/v1/students", tags=["students"])
app.include_router(timetable.router, prefix="/api/v1/timetable", tags=["timetable"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(finance.router, prefix="/api/v1/finance", tags=["finance"])
app.include_router(grades.router, prefix="/api/v1/grades", tags=["grades"])
app.include_router(academics.router, prefix="/api/v1/academics", tags=["academics"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(roles.router, prefix="/api/v1/roles", tags=["roles"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["attendance"])
@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok"}
