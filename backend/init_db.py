import asyncio
import asyncpg
import sys

async def main():
    try:
        # Connect to default 'postgres' database to create new database
        conn = await asyncpg.connect(user='postgres', password='1234', database='postgres', host='localhost')
        
        # Check if ssms_db exists
        exists = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = 'ssms_db'")
        if not exists:
            # We can't use parameterized queries for CREATE DATABASE, so we execute it directly
            await conn.execute('CREATE DATABASE ssms_db')
            print("Database 'ssms_db' created successfully.")
        else:
            print("Database 'ssms_db' already exists.")
            
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
