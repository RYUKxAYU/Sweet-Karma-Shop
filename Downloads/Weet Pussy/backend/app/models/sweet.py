import uuid
import enum
from sqlalchemy import Column, Integer, String, Float, Enum, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.sqlite import CHAR

from app.database import Base


class SweetCategory(str, enum.Enum):
    """Enum for sweet categories."""
    CHOCOLATE = "Chocolate"
    CANDY = "Candy"
    PASTRY = "Pastry"


class Sweet(Base):
    """Sweet model for the shop inventory."""
    
    __tablename__ = "sweets"
    
    id: Mapped[str] = mapped_column(
        CHAR(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    category: Mapped[SweetCategory] = mapped_column(
        Enum(SweetCategory), 
        nullable=False
    )
    price: Mapped[float] = mapped_column(Float, nullable=False)
    quantity: Mapped[int] = mapped_column(
        Integer, 
        default=0, 
        nullable=False
    )
    image_url: Mapped[str] = mapped_column(
        String(500), 
        nullable=True,
        default=None
    )
    
    __table_args__ = (
        CheckConstraint('quantity >= 0', name='check_quantity_non_negative'),
    )
    
    def __repr__(self) -> str:
        return f"<Sweet(id={self.id}, name={self.name}, quantity={self.quantity})>"
