from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.sweet import (
    SweetCreate, SweetUpdate, SweetResponse, 
    PurchaseRequest, PurchaseResponse
)
from app.services.sweet_service import SweetService
from app.repositories.sweet_repository import InsufficientStockError, SweetNotFoundError
from app.security.dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/sweets", tags=["Sweets"])


@router.get("", response_model=List[SweetResponse])
async def list_sweets(
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get all available sweets.
    
    This endpoint is public - no authentication required.
    """
    sweet_service = SweetService(db)
    sweets = await sweet_service.get_all_sweets()
    return [SweetResponse.model_validate(s) for s in sweets]


@router.get("/{sweet_id}", response_model=SweetResponse)
async def get_sweet(
    sweet_id: str,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """
    Get a single sweet by ID.
    
    This endpoint is public - no authentication required.
    """
    sweet_service = SweetService(db)
    sweet = await sweet_service.get_sweet(sweet_id)
    
    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    
    return SweetResponse.model_validate(sweet)


@router.post("", response_model=SweetResponse, status_code=status.HTTP_201_CREATED)
async def create_sweet(
    sweet_data: SweetCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_admin_user)]
):
    """
    Create a new sweet.
    
    Admin only endpoint.
    """
    sweet_service = SweetService(db)
    sweet = await sweet_service.create_sweet(sweet_data)
    return SweetResponse.model_validate(sweet)


@router.put("/{sweet_id}", response_model=SweetResponse)
async def update_sweet(
    sweet_id: str,
    sweet_data: SweetUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_admin_user)]
):
    """
    Update a sweet.
    
    Admin only endpoint.
    """
    sweet_service = SweetService(db)
    sweet = await sweet_service.update_sweet(sweet_id, sweet_data)
    
    if not sweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    
    return SweetResponse.model_validate(sweet)


@router.delete("/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sweet(
    sweet_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: Annotated[User, Depends(get_admin_user)]
):
    """
    Delete a sweet.
    
    Admin only endpoint.
    """
    sweet_service = SweetService(db)
    deleted = await sweet_service.delete_sweet(sweet_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )


@router.post("/{sweet_id}/purchase", response_model=PurchaseResponse)
async def purchase_sweet(
    sweet_id: str,
    purchase_data: PurchaseRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Purchase a sweet.
    
    This endpoint handles atomic purchases to prevent race conditions
    when multiple users try to purchase the last item simultaneously.
    
    Requires authentication.
    
    Returns:
        - 200: Purchase successful
        - 404: Sweet not found
        - 422: Insufficient stock
    """
    sweet_service = SweetService(db)
    
    try:
        return await sweet_service.purchase_sweet(sweet_id, purchase_data.quantity, current_user.id)
    except SweetNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sweet not found"
        )
    except InsufficientStockError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
