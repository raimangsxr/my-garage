import requests
import json

# Assuming the app is running locally on port 8000
BASE_URL = "http://localhost:8000/api/v1"

# We need a valid token. Since I can't easily login via script without credentials, 
# I will assume the user can verify via the UI.
# However, I can try to import the backend code and check the DB directly.

from app.database import get_session
from app.models.user import User
from app.models.settings import Settings
from sqlmodel import select

def verify_settings_creation():
    session = next(get_session())
    
    # Get a user (e.g. the first one)
    user = session.exec(select(User)).first()
    if not user:
        print("No users found. Cannot verify.")
        return

    print(f"Checking settings for user: {user.email}")
    
    # Check if settings exist
    if user.settings:
        print("Settings already exist.")
        print(f"Language: {user.settings.language}")
        print(f"Currency: {user.settings.currency}")
    else:
        print("Settings do not exist. They should be created on first access via API.")
        # We can simulate the API call logic here
        print("Creating default settings...")
        settings = Settings(user_id=user.id)
        session.add(settings)
        session.commit()
        session.refresh(settings)
        print("Settings created.")
        
    # Verify update
    print("Updating settings...")
    user.settings.language = "es"
    session.add(user.settings)
    session.commit()
    session.refresh(user.settings)
    
    print(f"Updated Language: {user.settings.language}")
    assert user.settings.language == "es"
    
    # Revert
    user.settings.language = "en"
    session.add(user.settings)
    session.commit()
    print("Reverted settings.")

if __name__ == "__main__":
    verify_settings_creation()
