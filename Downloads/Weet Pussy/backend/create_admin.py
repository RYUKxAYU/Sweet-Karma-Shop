import asyncio
from app.database import async_session
from app.services.auth_service import AuthService

async def create_admin():
    async with async_session() as session:
        auth = AuthService(session)
        try:
            await auth.create_admin("admin@sweetshop.com", "admin123")
            print("Admin user created successfully!")
            print("Email: admin@sweetshop.com")
            print("Password: admin123")
        except Exception as e:
            print(f"Note: {e}")

if __name__ == "__main__":
    asyncio.run(create_admin())
