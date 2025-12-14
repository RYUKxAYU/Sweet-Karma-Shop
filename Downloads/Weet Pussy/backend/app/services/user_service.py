from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext

from app.models.user import User
from app.models.order import Order
from app.schemas.user import UserProfileUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:
    """Service for user-related operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_profile(self, user_id: int) -> Optional[User]:
        """Get user profile by ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def update_user_profile(self, user_id: int, profile_data: UserProfileUpdate) -> Optional[User]:
        """Update user profile."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Update only provided fields
        update_data = profile_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_user_orders(self, user_id: int) -> List[Order]:
        """Get user's order history."""
        result = await self.db.execute(
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.createdAt.desc())
        )
        return result.scalars().all()
    
    async def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return False
        
        # Verify current password
        if not pwd_context.verify(current_password, user.hashed_password):
            return False
        
        # Update password
        user.hashed_password = pwd_context.hash(new_password)
        await self.db.commit()
        return True
    
    async def delete_user_account(self, user_id: int) -> bool:
        """Delete user account and related data."""
        # Delete user's orders first
        await self.db.execute(
            select(Order).where(Order.user_id == user_id)
        )
        
        # Delete user
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if user:
            await self.db.delete(user)
            await self.db.commit()
            return True
        
        return False