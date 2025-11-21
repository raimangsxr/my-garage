from sqlalchemy import create_engine, inspect
from app.database import DATABASE_URL
import os

# Ensure we use the same DATABASE_URL as the app
print(f"Connecting to: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

if inspector.has_table("user"):
    print("\nTable 'user' exists. Columns:")
    columns = inspector.get_columns("user")
    for column in columns:
        print(f"- {column['name']} ({column['type']})")
else:
    print("\nTable 'user' does NOT exist.")
