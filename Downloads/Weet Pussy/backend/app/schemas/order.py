from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class OrderStatus(str, Enum):
    """Order status enum."""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class OrderResponse(BaseModel):
    """Schema for order response."""
    id: int
    user_id: int
    sweet_id: str
    sweet_name: str
    quantity: int
    unit_price: float
    total: float
    status: OrderStatus
    createdAt: datetime
    
    class Config:
        from_attributes = True