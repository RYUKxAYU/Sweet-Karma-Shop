"""
Concurrency Tests for Sweet Shop Purchase Logic

These tests verify that the atomic purchase logic properly handles
concurrent access scenarios, particularly the "last item" race condition.

Written FIRST as per TDD methodology.
"""
import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.main import app
from app.database import Base, get_db
from app.models import User, Sweet, SweetCategory
from app.security.password import hash_password


@pytest.mark.asyncio
async def test_concurrent_purchase_last_item():
    """
    Scenario: Two users attempt to purchase the last sweet simultaneously.
    
    Expected Result:
        - One request succeeds with 200 OK
        - One request fails with 422 Unprocessable Entity
        - Final quantity in database is 0
    
    This test guarantees data integrity under race conditions.
    """
    # Setup: Create isolated test database
    test_db_url = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(test_db_url, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session_factory = async_sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    # Create test data: user and sweet with quantity=1
    async with async_session_factory() as session:
        # Create user
        user = User(
            email="racer@test.com",
            hashed_password=hash_password("testpass123"),
            is_admin=False
        )
        session.add(user)
        
        # Create sweet with ONLY 1 item (the last one!)
        sweet = Sweet(
            name="Last Chocolate",
            category=SweetCategory.CHOCOLATE,
            price=9.99,
            quantity=1  # CRITICAL: Only 1 item available
        )
        session.add(sweet)
        await session.commit()
        await session.refresh(sweet)
        sweet_id = sweet.id
    
    # Override dependency
    async def override_get_db():
        async with async_session_factory() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Get auth token
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_response = await client.post("/api/auth/login", json={
            "email": "racer@test.com",
            "password": "testpass123"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Execute: Two concurrent purchase requests
        async def purchase():
            async with AsyncClient(transport=transport, base_url="http://test") as c:
                return await c.post(
                    f"/api/sweets/{sweet_id}/purchase",
                    json={"quantity": 1},
                    headers=headers
                )
        
        # Launch concurrent purchases
        results = await asyncio.gather(purchase(), purchase(), return_exceptions=True)
    
    # Analyze results
    status_codes = [r.status_code for r in results if not isinstance(r, Exception)]
    
    # Assertions
    assert 200 in status_codes, "One request should succeed with 200"
    assert 422 in status_codes, "One request should fail with 422 (insufficient stock)"
    assert status_codes.count(200) == 1, "Exactly one request should succeed"
    assert status_codes.count(422) == 1, "Exactly one request should fail"
    
    # Verify final database state
    async with async_session_factory() as session:
        result = await session.execute(select(Sweet).where(Sweet.id == sweet_id))
        final_sweet = result.scalar_one()
        assert final_sweet.quantity == 0, "Final quantity should be exactly 0"
    
    # Cleanup
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_concurrent_purchase_multiple_items():
    """
    Scenario: Multiple users try to purchase from limited stock.
    
    Setup: 5 items available, 10 concurrent purchase requests (1 each)
    Expected: Exactly 5 succeed, 5 fail, final quantity = 0
    """
    test_db_url = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(test_db_url, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session_factory = async_sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    async with async_session_factory() as session:
        user = User(
            email="multi@test.com",
            hashed_password=hash_password("testpass123"),
            is_admin=False
        )
        session.add(user)
        
        sweet = Sweet(
            name="Limited Candy",
            category=SweetCategory.CANDY,
            price=2.99,
            quantity=5  # Only 5 items
        )
        session.add(sweet)
        await session.commit()
        await session.refresh(sweet)
        sweet_id = sweet.id
    
    async def override_get_db():
        async with async_session_factory() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_response = await client.post("/api/auth/login", json={
            "email": "multi@test.com",
            "password": "testpass123"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        async def purchase():
            async with AsyncClient(transport=transport, base_url="http://test") as c:
                return await c.post(
                    f"/api/sweets/{sweet_id}/purchase",
                    json={"quantity": 1},
                    headers=headers
                )
        
        # 10 concurrent requests for 5 items
        results = await asyncio.gather(*[purchase() for _ in range(10)], return_exceptions=True)
    
    status_codes = [r.status_code for r in results if not isinstance(r, Exception)]
    success_count = status_codes.count(200)
    fail_count = status_codes.count(422)
    
    # Verify: exactly 5 succeed, at least 5 fail
    assert success_count == 5, f"Expected 5 successes, got {success_count}"
    assert fail_count == 5, f"Expected 5 failures (422), got {fail_count}"
    
    # Verify final state
    async with async_session_factory() as session:
        result = await session.execute(select(Sweet).where(Sweet.id == sweet_id))
        final_sweet = result.scalar_one()
        assert final_sweet.quantity == 0, "Final quantity should be 0"
    
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio  
async def test_purchase_exact_available_quantity():
    """
    Test purchasing exactly the available quantity succeeds.
    """
    test_db_url = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(test_db_url, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session_factory = async_sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    async with async_session_factory() as session:
        user = User(
            email="exact@test.com",
            hashed_password=hash_password("testpass123"),
            is_admin=False
        )
        session.add(user)
        
        sweet = Sweet(
            name="Exact Pastry",
            category=SweetCategory.PASTRY,
            price=4.50,
            quantity=3
        )
        session.add(sweet)
        await session.commit()
        await session.refresh(sweet)
        sweet_id = sweet.id
    
    async def override_get_db():
        async with async_session_factory() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_response = await client.post("/api/auth/login", json={
            "email": "exact@test.com",
            "password": "testpass123"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Purchase exactly 3 items
        response = await client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 3},
            headers=headers
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["quantity_purchased"] == 3
    assert data["sweet"]["quantity"] == 0
    
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_purchase_more_than_available_fails():
    """
    Test purchasing more than available quantity fails with 422.
    """
    test_db_url = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(test_db_url, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session_factory = async_sessionmaker(
        engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    async with async_session_factory() as session:
        user = User(
            email="overflow@test.com",
            hashed_password=hash_password("testpass123"),
            is_admin=False
        )
        session.add(user)
        
        sweet = Sweet(
            name="Limited Chocolate",
            category=SweetCategory.CHOCOLATE,
            price=7.99,
            quantity=2
        )
        session.add(sweet)
        await session.commit()
        await session.refresh(sweet)
        sweet_id = sweet.id
    
    async def override_get_db():
        async with async_session_factory() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        login_response = await client.post("/api/auth/login", json={
            "email": "overflow@test.com",
            "password": "testpass123"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to purchase 5 when only 2 available
        response = await client.post(
            f"/api/sweets/{sweet_id}/purchase",
            json={"quantity": 5},
            headers=headers
        )
    
    assert response.status_code == 422
    assert "Insufficient stock" in response.json()["detail"]
    
    # Verify quantity unchanged
    async with async_session_factory() as session:
        result = await session.execute(select(Sweet).where(Sweet.id == sweet_id))
        sweet = result.scalar_one()
        assert sweet.quantity == 2, "Quantity should remain unchanged after failed purchase"
    
    app.dependency_overrides.clear()
    await engine.dispose()
