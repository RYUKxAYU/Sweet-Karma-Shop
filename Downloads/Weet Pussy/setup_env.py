#!/usr/bin/env python3
"""
Environment setup script for Sweet Shop Management System
Helps set up environment variables for development and production
"""

import os
import secrets
import shutil
from pathlib import Path


def generate_secret_key(length=64):
    """Generate a secure random secret key."""
    return secrets.token_urlsafe(length)


def setup_backend_env():
    """Set up backend environment file."""
    backend_dir = Path("backend")
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"
    
    if env_file.exists():
        print(f"✅ Backend .env already exists at {env_file}")
        return
    
    if not env_example.exists():
        print(f"❌ Backend .env.example not found at {env_example}")
        return
    
    # Copy example to .env
    shutil.copy(env_example, env_file)
    
    # Generate secure JWT secret
    jwt_secret = generate_secret_key()
    
    # Read and update .env file
    with open(env_file, 'r') as f:
        content = f.read()
    
    # Replace placeholder values
    content = content.replace(
        'JWT_SECRET_KEY=your-super-secret-key-change-in-production-make-it-long-and-random',
        f'JWT_SECRET_KEY={jwt_secret}'
    )
    
    with open(env_file, 'w') as f:
        f.write(content)
    
    print(f"✅ Backend .env created at {env_file}")
    print(f"🔑 Generated secure JWT secret key")


def setup_frontend_env():
    """Set up frontend environment file."""
    frontend_dir = Path("frontend")
    env_file = frontend_dir / ".env"
    env_example = frontend_dir / ".env.example"
    
    if env_file.exists():
        print(f"✅ Frontend .env already exists at {env_file}")
        return
    
    if not env_example.exists():
        print(f"❌ Frontend .env.example not found at {env_example}")
        return
    
    # Copy example to .env
    shutil.copy(env_example, env_file)
    print(f"✅ Frontend .env created at {env_file}")


def create_directories():
    """Create necessary directories."""
    directories = [
        "backend/logs",
        "backend/uploads",
        "backend/app/uploads"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {directory}")


def main():
    """Main setup function."""
    print("🚀 Setting up Sweet Shop Management System environment...")
    print()
    
    # Setup environment files
    setup_backend_env()
    setup_frontend_env()
    
    # Create directories
    create_directories()
    
    print()
    print("✅ Environment setup complete!")
    print()
    print("📋 Next steps:")
    print("1. Review and update backend/.env with your specific values")
    print("2. Review and update frontend/.env with your specific values")
    print("3. Never commit .env files to version control")
    print("4. Use .env.example files as templates for deployment")
    print()
    print("🔒 Security reminders:")
    print("- Change JWT_SECRET_KEY in production")
    print("- Use strong database passwords")
    print("- Keep API keys secure")
    print("- Enable HTTPS in production")


if __name__ == "__main__":
    main()