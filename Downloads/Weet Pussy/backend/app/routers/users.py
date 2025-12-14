from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserProfileUpdate, UserProfileResponse, PasswordChange
from app.schemas.order import OrderResponse
from app.services.user_service import UserService
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get current user's profile information.
    
    Requires authentication.
    """
    user_service = UserService(db)
    profile = await user_service.get_user_profile(current_user.id)
    return UserProfileResponse.model_validate(profile)


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Update current user's profile information.
    
    Requires authentication.
    """
    user_service = UserService(db)
    updated_profile = await user_service.update_user_profile(current_user.id, profile_data)
    
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserProfileResponse.model_validate(updated_profile)


@router.get("/orders", response_model=List[OrderResponse])
async def get_order_history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get current user's order history.
    
    Requires authentication.
    """
    user_service = UserService(db)
    orders = await user_service.get_user_orders(current_user.id)
    return [OrderResponse.model_validate(order) for order in orders]


@router.put("/password")
async def change_password(
    password_data: PasswordChange,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Change user's password.
    
    Requires authentication and current password verification.
    """
    user_service = UserService(db)
    success = await user_service.change_password(
        current_user.id, 
        password_data.current_password, 
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    return {"message": "Password changed successfully"}


@router.delete("/profile", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Delete current user's account.
    
    Requires authentication. This action is irreversible.
    """
    user_service = UserService(db)
    await user_service.delete_user_account(current_user.id)