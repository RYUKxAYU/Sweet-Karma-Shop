#!/usr/bin/env python3
import sqlite3

# Connect to database
conn = sqlite3.connect('sweetshop.db')
cursor = conn.cursor()

# Delete sweets with broken image URLs
cursor.execute("DELETE FROM sweets WHERE image_url LIKE '%localhost:8000/uploads%'")
deleted_count = cursor.rowcount

# Commit changes
conn.commit()
conn.close()

print(f"Deleted {deleted_count} sweets with broken image URLs")
print("Database cleaned up successfully!")