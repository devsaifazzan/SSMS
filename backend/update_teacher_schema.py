import asyncio
import os
from app.core.database import engine
from sqlalchemy import text

async def update_schema():
    print("Updating teacher_profiles table schema on Neon...")
    queries = [
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(20);",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS national_id VARCHAR(50);",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS specialization VARCHAR(100);",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS qualification VARCHAR(100);",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS address TEXT;",
        "ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';"
    ]
    async with engine.begin() as conn:
        for q in queries:
            await conn.execute(text(q))
    print("Teacher profiles schema updated successfully!")

if __name__ == "__main__":
    asyncio.run(update_schema())
