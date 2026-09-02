import asyncio
import asyncpg
import sys

async def main():
    passwords = ['postgres', 'root', 'admin', 'password', '123456', '']
    for pwd in passwords:
        try:
            conn = await asyncpg.connect(user='postgres', password=pwd, database='postgres', host='localhost')
            print(f'SUCCESS with password: {pwd}')
            await conn.close()
            return
        except Exception as e:
            pass
    print('FAILED to connect with common passwords')

asyncio.run(main())
