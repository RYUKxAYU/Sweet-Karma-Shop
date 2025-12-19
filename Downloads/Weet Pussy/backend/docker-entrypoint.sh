#!/bin/bash
set -e

echo "🍬 Starting Sweet Shop API..."

# Create necessary directories
mkdir -p /app/uploads /app/logs /app/data

# Run database migrations if needed
echo "📊 Setting up database..."
python -c "
import asyncio
from app.database import create_tables

async def setup_db():
    await create_tables()
    print('✅ Database tables created')

asyncio.run(setup_db())
"

# Create admin user if it doesn't exist
echo "👤 Setting up admin user..."
python -c "
import asyncio
from app.database import async_session
from app.services.auth_service import AuthService

async def create_admin():
    try:
        async with async_session() as session:
            auth_service = AuthService(session)
            if not await auth_service.user_repo.exists('admin@sweetshop.com'):
                await auth_service.create_admin('admin@sweetshop.com', 'admin123')
                print('✅ Admin user created: admin@sweetshop.com / admin123')
            else:
                print('✅ Admin user already exists')
    except Exception as e:
        print(f'⚠️  Admin user setup: {e}')

asyncio.run(create_admin())
"

echo "🚀 Starting server..."
exec "$@"