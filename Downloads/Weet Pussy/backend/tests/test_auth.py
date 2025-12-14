"""
Authentication Tests for Sweet Shop API
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_new_user(client: AsyncClient):
    """Test user registration."""
    response = await client.post("/api/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepass123"
    })
    
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["is_admin"] is False


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user):
    """Test registration with existing email fails."""
    response = await client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "anotherpass123"
    })
    
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    """Test registration with weak password fails."""
    response = await client.post("/api/auth/register", json={
        "email": "weak@example.com",
        "password": "short"
    })
    
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_login_valid_credentials(client: AsyncClient, test_user):
    """Test login with valid credentials."""
    response = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_invalid_email(client: AsyncClient):
    """Test login with non-existent email."""
    response = await client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "password123"
    })
    
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_user):
    """Test login with wrong password."""
    response = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_protected_endpoint_without_token(client: AsyncClient, test_sweet):
    """Test accessing protected endpoint without token fails."""
    response = await client.post(
        f"/api/sweets/{test_sweet.id}/purchase",
        json={"quantity": 1}
    )
    
    assert response.status_code == 401  # Unauthorized (no credentials)



@pytest.mark.asyncio
async def test_protected_endpoint_with_invalid_token(client: AsyncClient, test_sweet):
    """Test accessing protected endpoint with invalid token fails."""
    response = await client.post(
        f"/api/sweets/{test_sweet.id}/purchase",
        json={"quantity": 1},
        headers={"Authorization": "Bearer invalid_token_here"}
    )
    
    assert response.status_code == 401
