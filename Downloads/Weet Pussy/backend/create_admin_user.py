#!/usr/bin/env python3
"""
Script to create an admin user for the Sweet Shop application.
Run this script to create an admin account for testing.
"""

import asyncio
import sys
from app.database import async_session
from app.services.auth_service import AuthService

async def create_admin_user():
    """Create an admin user."""
    print("🍬 Sweet Shop Admin User Creator")
    print("=" * 40)
    
    email = input("Enter admin email: ").strip()
    if not email:
        print("❌ Email cannot be empty")
        return
    
    password = input("Enter admin password: ").strip()
    if not password:
        print("❌ Password cannot be empty")
        return
    
    if len(password) < 6:
        print("❌ Password must be at least 6 characters long")
        return
    
    try:
        async with async_session() as session:
            auth_service = AuthService(session)
            
            # Check if user already exists
            existing_user = await auth_service.get_user_by_email(email)
            if existing_user:
                print(f"❌ User with email {email} already exists")
                return
            
            # Create admin user
            user = await auth_service.create_user(email, password, is_admin=True)
            print(f"✅ Admin user created successfully!")
            print(f"📧 Email: {user.email}")
            print(f"🛡️  Admin: {user.is_admin}")
            print(f"🆔 ID: {user.id}")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")

if __name__ == "__main__":
    asyncio.run(create_admin_user())