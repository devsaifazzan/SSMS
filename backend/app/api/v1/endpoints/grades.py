from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.domain import Mark
from app.schemas.domain import APIResponse, MarkCreate, MarkResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_grades(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Mark))
    marks = result.scalars().all()
    return APIResponse(status="success", data=[MarkResponse.model_validate(m) for m in marks])

@router.post("/", response_model=APIResponse)
async def add_grade(mark_in: MarkCreate, db: AsyncSession = Depends(get_db)):
    new_mark = Mark(**mark_in.model_dump())
    db.add(new_mark)
    await db.commit()
    await db.refresh(new_mark)
    return APIResponse(status="success", data=MarkResponse.model_validate(new_mark))
