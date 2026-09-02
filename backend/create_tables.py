import asyncio
from app.core.database import engine, Base
from app.models.domain import * # Import all models so Base knows about them

async def init_models():
    async with engine.begin() as conn:
        # Drop all tables
        await conn.run_sync(Base.metadata.drop_all)
        print("Dropped old tables.")
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully.")

if __name__ == "__main__":
    asyncio.run(init_models())
