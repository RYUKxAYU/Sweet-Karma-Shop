from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.models.sweet import Sweet, SweetCategory


class InsufficientStockError(Exception):
    """Raised when there's not enough stock for a purchase."""
    pass


class SweetNotFoundError(Exception):
    """Raised when a sweet is not found."""
    pass


class SweetRepository:
    """Data access layer for Sweet model with atomic operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_all(self) -> List[Sweet]:
        """Get all sweets."""
        result = await self.session.execute(select(Sweet).order_by(Sweet.name))
        return list(result.scalars().all())
    
    async def get_by_id(self, sweet_id: str) -> Optional[Sweet]:
        """Get sweet by ID."""
        result = await self.session.execute(
            select(Sweet).where(Sweet.id == sweet_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_name(self, name: str) -> Optional[Sweet]:
        """Get sweet by name."""
        result = await self.session.execute(
            select(Sweet).where(Sweet.name == name)
        )
        return result.scalar_one_or_none()
    
    async def create(
        self,
        name: str,
        category: SweetCategory,
        price: float,
        quantity: int = 0,
        image_url: Optional[str] = None
    ) -> Sweet:
        """Create a new sweet."""
        sweet = Sweet(
            name=name,
            category=category,
            price=price,
            quantity=quantity,
            image_url=image_url
        )
        self.session.add(sweet)
        await self.session.commit()
        await self.session.refresh(sweet)
        return sweet
    
    async def update(
        self,
        sweet_id: str,
        name: Optional[str] = None,
        category: Optional[SweetCategory] = None,
        price: Optional[float] = None,
        quantity: Optional[int] = None,
        image_url: Optional[str] = None
    ) -> Optional[Sweet]:
        """Update a sweet's attributes."""
        sweet = await self.get_by_id(sweet_id)
        if not sweet:
            return None
        
        if name is not None:
            sweet.name = name
        if category is not None:
            sweet.category = category
        if price is not None:
            sweet.price = price
        if quantity is not None:
            sweet.quantity = quantity
        if image_url is not None:
            sweet.image_url = image_url
        
        await self.session.commit()
        await self.session.refresh(sweet)
        return sweet
    
    async def delete(self, sweet_id: str) -> bool:
        """Delete a sweet."""
        sweet = await self.get_by_id(sweet_id)
        if not sweet:
            return False
        
        await self.session.delete(sweet)
        await self.session.commit()
        return True
    
    async def atomic_purchase(self, sweet_id: str, quantity: int = 1) -> Sweet:
        """
        Atomically purchase a sweet, decrementing its quantity.
        
        This method ensures concurrency safety by using SQLAlchemy's
        session-level transactions with optimistic locking pattern.
        
        Raises:
            SweetNotFoundError: If the sweet doesn't exist
            InsufficientStockError: If there's not enough stock
        """
        # Fetch the sweet
        result = await self.session.execute(
            select(Sweet).where(Sweet.id == sweet_id)
        )
        sweet = result.scalar_one_or_none()
        
        if not sweet:
            raise SweetNotFoundError(f"Sweet with id {sweet_id} not found")
        
        # Check if we have enough stock
        if sweet.quantity < quantity:
            raise InsufficientStockError(
                f"Insufficient stock. Available: {sweet.quantity}, Requested: {quantity}"
            )
        
        # Decrement quantity atomically using WHERE clause for safety
        # This ensures the operation only succeeds if quantity is still sufficient
        stmt = (
            update(Sweet)
            .where(Sweet.id == sweet_id)
            .where(Sweet.quantity >= quantity)
            .values(quantity=Sweet.quantity - quantity)
        )
        result = await self.session.execute(stmt)
        
        if result.rowcount == 0:
            # Race condition - another transaction got there first
            raise InsufficientStockError(
                f"Insufficient stock. The item may have been purchased by another user."
            )
        
        await self.session.commit()
        
        # Refresh to get updated value
        await self.session.refresh(sweet)
        return sweet
