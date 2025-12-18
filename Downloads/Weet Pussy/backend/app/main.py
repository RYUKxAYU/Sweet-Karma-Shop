import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import create_tables
from app.routers import auth_router, sweets_router
from app.routers.upload import router as upload_router
from app.routers.users import router as users_router

settings = get_settings()

# Upload directory path
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown."""
    # Startup: Create tables and upload directory
    await create_tables()
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown: cleanup if needed


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="A sweet shop management system with concurrency-safe purchases",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded images
# This must be done after app creation but before routes
uploads_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(sweets_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(upload_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to the Sweet Shop API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api")
async def api_root():
    """API root endpoint."""
    return {
        "message": "Sweet Shop API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/auth",
            "sweets": "/api/sweets",
            "users": "/api/users",
            "upload": "/upload"
        }
    }
