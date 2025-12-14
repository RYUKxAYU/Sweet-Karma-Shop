import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.sqlite import CHAR

from app.database import Base


class OrderStatus(str, enum.Enum):
    """Enum for order status."""
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Order(Base):
    """Order model for tracking purchases."""
    
    __tablename__ = "orders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    sweet_id: Mapped[str] = mapped_column(CHAR(36), ForeignKey("sweets.id"), nullable=False)
    sweet_name: Mapped[str] = mapped_column(String(255), nullable=False)  # Store name for history
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    total: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), 
        default=OrderStatus.COMPLETED,
        nullable=False
    )
    createdAt: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<Order(id={self.id}, user_id={self.user_id}, sweet_name={self.sweet_name}, total={self.total})>"