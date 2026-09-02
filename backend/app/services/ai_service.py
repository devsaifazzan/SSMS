from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from app.core.config import settings
from app.models.domain import AIStudentNote
from app.schemas.domain import AIStudentNoteResponse

client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None

async def generate_student_insights(db: AsyncSession, student_id: int) -> dict:
    # In a real app, we would fetch attendance, grades, etc.
    # For now, we mock the context.
    prompt = f"Generate a short academic summary and suggestions for student ID {student_id} based on average performance."
    
    if client:
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            note_content = response.text
        except Exception as e:
            note_content = f"AI Generation failed: {str(e)}"
    else:
        note_content = "Mock AI Note: The student is performing well but needs to improve attendance in morning classes."

    # Save to database
    ai_note = AIStudentNote(
        student_id=student_id,
        note_content=note_content,
        insights_json={"sentiment": "positive"},
        requires_intervention=False
    )
    
    db.add(ai_note)
    await db.commit()
    await db.refresh(ai_note)
    
    return AIStudentNoteResponse.model_validate(ai_note).model_dump()
