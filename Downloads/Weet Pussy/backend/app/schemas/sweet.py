from pydantic import BaseModel, Field
from typing import Optional
from app.models.sweet import SweetCategory


class SweetBase(BaseModel):
    """Base sweet schema."""
    name: str = Field(..., min_length=1, max_length=255)
    category: SweetCategory
    price: float = Field(..., gt=0, description="Price must be positive")
    quantity: int = Field(..., ge=0, description="Quantity must be non-negative")
    image_url: Optional[str] = Field(None, max_length=500, description="URL to sweet image")


class SweetCreate(SweetBase):
    """Schema for creating a sweet."""
    pass


class SweetUpdate(BaseModel):
    """Schema for updating a sweet."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[SweetCategory] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)


class SweetResponse(SweetBase):
    """Schema for sweet response."""
    id: str
    
    class Config:
        from_attributes = True


class PurchaseRequest(BaseModel):
    """Schema for purchase request."""
    quantity: int = Field(default=1, ge=1, description="Quantity to purchase")


class PurchaseResponse(BaseModel):
    """Schema for purchase response."""
    success: bool
    message: str
    sweet: SweetResponse
    quantity_purchased: int
