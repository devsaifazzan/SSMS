import asyncio
import os
import sys

# Add the current directory to sys.path so we can import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import get_password_hash
import asyncpg

async def add_admin():
    try:
        # Check if bcrypt is supported, if it fails here we'll see
        hashed = get_password_hash("admin123")
        
        from app.core.config import settings
        db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        conn = await asyncpg.connect(db_url)
        
        # Check if admin user exists
        existing = await conn.fetchval('SELECT id FROM users WHERE username = $1', 'admin')
        
        # Check if Admin role exists
        admin_role_id = await conn.fetchval("SELECT id FROM roles WHERE name = 'Admin'")
        if not admin_role_id:
            admin_role_id = await conn.fetchval("INSERT INTO roles (name, description) VALUES ('Admin', 'System Administrator') RETURNING id")
            print("Admin role created successfully!")
        
        if existing:
            # Update password
            await conn.execute('UPDATE users SET hashed_password = $1 WHERE id = $2', hashed, existing)
            print("Admin user updated with new password!")
        else:
            # Insert admin user
            await conn.execute(
                'INSERT INTO users (username, email, hashed_password, role_id, is_active) VALUES ($1, $2, $3, $4, $5)',
                'admin', 'admin@example.com', hashed, admin_role_id, True
            )
            print("Admin user created successfully!")
            
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(add_admin())
