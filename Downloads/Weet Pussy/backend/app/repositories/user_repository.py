from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.security.password import hash_password


class UserRepository:
    """Data access layer for User model."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def create(
        self, 
        email: str, 
        password: str, 
        is_admin: bool = False
    ) -> User:
        """Create a new user."""
        hashed_password = hash_password(password)
        user = User(
            email=email,
            hashed_password=hashed_password,
            is_admin=is_admin
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user
    
    async def update_2fa_secret(self, user_id: int, secret: str) -> Optional[User]:
        """Update user's 2FA secret."""
        user = await self.get_by_id(user_id)
        if user:
            user.two_factor_secret = secret
            await self.session.commit()
            await self.session.refresh(user)
        return user
    
    async def exists(self, email: str) -> bool:
        """Check if user with email exists."""
        user = await self.get_by_email(email)
        return user is not None
