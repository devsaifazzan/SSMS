import asyncio
import asyncpg
import os
import sys

async def main():
    try:
        # URL from .env
        conn = await asyncpg.connect('postgresql://postgres:1234@localhost:5433/ssms_db')
        print("Successfully connected to the database!")
        
        # Read schema.sql
        with open('../schema.sql', 'r') as f:
            schema_sql = f.read()
            
        print("Executing schema.sql...")
        await conn.execute(schema_sql)
        print("Schema created successfully!")
        
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
