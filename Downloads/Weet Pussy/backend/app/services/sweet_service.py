from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.sweet_repository import (
    SweetRepository, 
    InsufficientStockError, 
    SweetNotFoundError
)
from app.models.sweet import Sweet, SweetCategory
from app.schemas.sweet import SweetCreate, SweetUpdate, SweetResponse, PurchaseResponse


class SweetService:
    """Business logic for sweet operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.sweet_repo = SweetRepository(session)
    
    async def get_all_sweets(self) -> List[Sweet]:
        """Get all available sweets."""
        return await self.sweet_repo.get_all()
    
    async def get_sweet(self, sweet_id: str) -> Optional[Sweet]:
        """Get a single sweet by ID."""
        return await self.sweet_repo.get_by_id(sweet_id)
    
    async def create_sweet(self, sweet_data: SweetCreate) -> Sweet:
        """Create a new sweet (admin only)."""
        return await self.sweet_repo.create(
            name=sweet_data.name,
            category=sweet_data.category,
            price=sweet_data.price,
            quantity=sweet_data.quantity,
            image_url=sweet_data.image_url
        )
    
    async def update_sweet(
        self, 
        sweet_id: str, 
        sweet_data: SweetUpdate
    ) -> Optional[Sweet]:
        """Update a sweet (admin only)."""
        return await self.sweet_repo.update(
            sweet_id=sweet_id,
            name=sweet_data.name,
            category=sweet_data.category,
            price=sweet_data.price,
            quantity=sweet_data.quantity,
            image_url=sweet_data.image_url
        )
    
    async def delete_sweet(self, sweet_id: str) -> bool:
        """Delete a sweet (admin only)."""
        return await self.sweet_repo.delete(sweet_id)
    
    async def purchase_sweet(
        self, 
        sweet_id: str, 
        quantity: int = 1
    ) -> PurchaseResponse:
        """
        Purchase a sweet atomically.
        
        This handles the critical section for concurrent purchases.
        """
        try:
            sweet = await self.sweet_repo.atomic_purchase(sweet_id, quantity)
            return PurchaseResponse(
                success=True,
                message=f"Successfully purchased {quantity} x {sweet.name}",
                sweet=SweetResponse.model_validate(sweet),
                quantity_purchased=quantity
            )
        except SweetNotFoundError as e:
            raise e
        except InsufficientStockError as e:
            raise e
