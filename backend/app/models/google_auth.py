from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class GoogleAuthToken(SQLModel, table=True):
    """Almacena tokens de Google OAuth para cada usuario"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    google_id: str = Field(unique=True, index=True)  # ID único de Google
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None
    
    access_token: str
    refresh_token: Optional[str] = None
    token_expires_at: datetime
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
