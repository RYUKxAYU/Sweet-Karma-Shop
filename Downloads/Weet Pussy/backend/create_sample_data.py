#!/usr/bin/env python3
"""
Script to create sample sweet data for testing the Sweet Shop application.
"""

import asyncio
from app.database import async_session
from app.models.sweet import Sweet

SAMPLE_SWEETS = [
    {
        "name": "Dark Chocolate Truffle",
        "category": "Chocolate",
        "price": 25.99,
        "quantity": 50,
        "image_url": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop"
    },
    {
        "name": "Milk Chocolate Bar",
        "category": "Chocolate", 
        "price": 15.50,
        "quantity": 75,
        "image_url": "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=300&fit=crop"
    },
    {
        "name": "Gummy Bears",
        "category": "Candy",
        "price": 12.99,
        "quantity": 100,
        "image_url": "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop"
    },
    {
        "name": "Rainbow Lollipops",
        "category": "Candy",
        "price": 8.99,
        "quantity": 60,
        "image_url": "https://images.unsplash.com/photo-1563262924-641a8b3d397f?w=400&h=300&fit=crop"
    },
    {
        "name": "Chocolate Croissant",
        "category": "Pastry",
        "price": 18.75,
        "quantity": 30,
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop"
    },
    {
        "name": "Strawberry Danish",
        "category": "Pastry",
        "price": 22.50,
        "quantity": 25,
        "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
    },
    {
        "name": "White Chocolate Fudge",
        "category": "Chocolate",
        "price": 28.99,
        "quantity": 40,
        "image_url": "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400&h=300&fit=crop"
    },
    {
        "name": "Sour Patch Kids",
        "category": "Candy",
        "price": 9.99,
        "quantity": 80,
        "image_url": "https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400&h=300&fit=crop"
    },
    {
        "name": "Blueberry Muffin",
        "category": "Pastry",
        "price": 16.25,
        "quantity": 35,
        "image_url": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop"
    },
    {
        "name": "Caramel Chocolate",
        "category": "Chocolate",
        "price": 32.99,
        "quantity": 20,
        "image_url": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop"
    }
]

async def create_sample_sweets():
    """Create sample sweet data."""
    print("🍬 Creating Sample Sweet Data")
    print("=" * 40)
    
    try:
        async with async_session() as session:
            created_count = 0
            
            for sweet_data in SAMPLE_SWEETS:
                # Check if sweet already exists
                existing = await session.execute(
                    "SELECT id FROM sweets WHERE name = ?", (sweet_data["name"],)
                )
                if existing.fetchone():
                    print(f"⏭️  Skipping '{sweet_data['name']}' (already exists)")
                    continue
                
                # Create new sweet
                sweet = Sweet(**sweet_data)
                session.add(sweet)
                created_count += 1
                print(f"✅ Created '{sweet_data['name']}'")
            
            await session.commit()
            print(f"\n🎉 Successfully created {created_count} sample sweets!")
            
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")

if __name__ == "__main__":
    asyncio.run(create_sample_sweets())