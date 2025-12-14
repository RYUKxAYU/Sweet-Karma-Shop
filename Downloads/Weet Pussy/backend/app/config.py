from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    """Application configuration settings."""
    
    # Application
    APP_NAME: str = "Sweet Shop API"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sweetshop.db"
    
    # JWT Security
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin Security
    ADMIN_IP_WHITELIST: str = "127.0.0.1,::1"
    ENABLE_IP_WHITELIST: bool = False
    
    # CORS Settings
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 5242880  # 5MB
    ALLOWED_FILE_TYPES: str = "image/jpeg,image/png,image/gif,image/webp"
    UPLOAD_DIR: str = "uploads"
    
    # Email Configuration (optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    
    # External API Keys (optional)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Redis Configuration (optional)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/sweetshop.log"
    
    class Config:
        env_file = ".env"
        extra = "allow"
    
    @property
    def admin_ip_list(self) -> List[str]:
        """Convert comma-separated IP list to actual list."""
        return [ip.strip() for ip in self.ADMIN_IP_WHITELIST.split(",") if ip.strip()]
    
    @property
    def cors_origins(self) -> List[str]:
        """Convert comma-separated origins to actual list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    @property
    def allowed_file_types_list(self) -> List[str]:
        """Convert comma-separated file types to actual list."""
        return [ft.strip() for ft in self.ALLOWED_FILE_TYPES.split(",") if ft.strip()]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT.lower() == "development"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
