#!/usr/bin/env python3
"""
Database migration script to add user profile fields and orders table.
"""

import asyncio
import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "sweetshop.db"


def migrate_database():
    """Apply database migrations."""
    print("Starting database migration...")
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        # Add profile fields to users table
        print("Adding profile fields to users table...")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'firstName' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN firstName VARCHAR(100)")
            print("Added firstName column")
        
        if 'lastName' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN lastName VARCHAR(100)")
            print("Added lastName column")
        
        if 'phone' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")
            print("Added phone column")
        
        if 'address' not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN address VARCHAR(500)")
            print("Added address column")
        
        # Create orders table
        print("Creating orders table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                sweet_id CHAR(36) NOT NULL,
                sweet_name VARCHAR(255) NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price FLOAT NOT NULL,
                total FLOAT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'completed',
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (sweet_id) REFERENCES sweets (id)
            )
        """)
        print("Created orders table")
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    migrate_database()