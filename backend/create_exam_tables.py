import asyncio
from app.core.database import engine
from sqlalchemy import text

async def create_exam_tables():
    print("Creating exam_schedules and seeding default exam types on Neon...")
    async with engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS exam_schedules (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                subject_id INTEGER NOT NULL REFERENCES subjects(id),
                section_id INTEGER REFERENCES sections(id),
                exam_type_id INTEGER NOT NULL REFERENCES exam_types(id),
                exam_date DATE NOT NULL,
                start_time VARCHAR(20) NOT NULL,
                end_time VARCHAR(20) NOT NULL,
                max_marks FLOAT DEFAULT 100.0,
                room VARCHAR(50)
            );
        """))
        # Seed exam_types if empty
        res = await conn.execute(text("SELECT COUNT(*) FROM exam_types;"))
        count = res.scalar()
        if count == 0:
            await conn.execute(text("""
                INSERT INTO exam_types (name, weight_percentage) VALUES 
                ('Midterm Exam', 30.0),
                ('Final Exam', 50.0),
                ('Quiz', 10.0),
                ('Assignment', 10.0);
            """))
    print("Exam schedules table and types initialized successfully!")

if __name__ == "__main__":
    asyncio.run(create_exam_tables())
