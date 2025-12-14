import enum
from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    """User model for authentication."""
    
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    two_factor_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Profile fields
    firstName: Mapped[str | None] = mapped_column(String(100), nullable=True)
    lastName: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, is_admin={self.is_admin})>"
