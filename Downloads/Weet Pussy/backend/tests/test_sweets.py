"""
Sweet API Tests
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_sweets_public(client: AsyncClient, test_sweet):
    """Test listing sweets without authentication."""
    response = await client.get("/api/sweets")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Chocolate"


@pytest.mark.asyncio
async def test_get_sweet_by_id(client: AsyncClient, test_sweet):
    """Test getting a single sweet by ID."""
    response = await client.get(f"/api/sweets/{test_sweet.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Chocolate"
    assert data["category"] == "Chocolate"
    assert data["price"] == 5.99


@pytest.mark.asyncio
async def test_get_nonexistent_sweet(client: AsyncClient):
    """Test getting a non-existent sweet returns 404."""
    response = await client.get("/api/sweets/nonexistent-id-12345")
    
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_sweet_admin(client: AsyncClient, admin_headers):
    """Test admin can create a sweet."""
    response = await client.post(
        "/api/sweets",
        json={
            "name": "New Candy",
            "category": "Candy",
            "price": 3.50,
            "quantity": 100
        },
        headers=admin_headers
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Candy"
    assert data["quantity"] == 100


@pytest.mark.asyncio
async def test_create_sweet_non_admin_forbidden(client: AsyncClient, auth_headers):
    """Test non-admin cannot create a sweet."""
    response = await client.post(
        "/api/sweets",
        json={
            "name": "Forbidden Candy",
            "category": "Candy",
            "price": 2.00,
            "quantity": 50
        },
        headers=auth_headers
    )
    
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_sweet_admin(client: AsyncClient, test_sweet, admin_headers):
    """Test admin can update a sweet."""
    response = await client.put(
        f"/api/sweets/{test_sweet.id}",
        json={"price": 7.99, "quantity": 25},
        headers=admin_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["price"] == 7.99
    assert data["quantity"] == 25


@pytest.mark.asyncio
async def test_delete_sweet_admin(client: AsyncClient, test_sweet, admin_headers):
    """Test admin can delete a sweet."""
    response = await client.delete(
        f"/api/sweets/{test_sweet.id}",
        headers=admin_headers
    )
    
    assert response.status_code == 204
    
    # Verify it's gone
    get_response = await client.get(f"/api/sweets/{test_sweet.id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_purchase_sweet_authenticated(client: AsyncClient, test_sweet, auth_headers):
    """Test authenticated user can purchase a sweet."""
    response = await client.post(
        f"/api/sweets/{test_sweet.id}/purchase",
        json={"quantity": 2},
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["quantity_purchased"] == 2
    assert data["sweet"]["quantity"] == 8  # 10 - 2


@pytest.mark.asyncio
async def test_purchase_sweet_unauthenticated_fails(client: AsyncClient, test_sweet):
    """Test unauthenticated user cannot purchase."""
    response = await client.post(
        f"/api/sweets/{test_sweet.id}/purchase",
        json={"quantity": 1}
    )
    
    assert response.status_code == 401
