#!/usr/bin/env python3
"""
Script to create a test admin user for the Sweet Shop application.
"""

import asyncio
import sys
from app.database import async_session
from app.services.auth_service import AuthService

async def create_test_admin():
    """Create a test admin user."""
    print("🍬 Creating Test Admin User")
    print("=" * 40)
    
    email = "admin@sweetshop.com"
    password = "admin123"
    
    try:
        async with async_session() as session:
            auth_service = AuthService(session)
            
            # Check if user already exists
            if await auth_service.user_repo.exists(email):
                existing_user = await auth_service.user_repo.get_by_email(email)
                print(f"✅ Admin user already exists: {email}")
                print(f"🛡️  Admin: {existing_user.is_admin}")
                print(f"🆔 ID: {existing_user.id}")
                return
            
            # Create admin user
            user = await auth_service.create_admin(email, password)
            print(f"✅ Admin user created successfully!")
            print(f"📧 Email: {user.email}")
            print(f"🔑 Password: {password}")
            print(f"🛡️  Admin: {user.is_admin}")
            print(f"🆔 ID: {user.id}")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_admin())