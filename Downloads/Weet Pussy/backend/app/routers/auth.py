from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.services.auth_service import AuthService, AuthenticationError, UserExistsError

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Register a new user.
    
    Returns a JWT token on successful registration.
    """
    auth_service = AuthService(db)
    
    try:
        return await auth_service.register(user_data)
    except UserExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Login with email and password.
    
    Returns a JWT token on successful authentication.
    """
    auth_service = AuthService(db)
    
    try:
        return await auth_service.login(user_data.email, user_data.password)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
