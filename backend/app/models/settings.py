from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User

class SettingsBase(SQLModel):
    language: str = Field(default="en")
    currency: str = Field(default="EUR")
    theme: str = Field(default="dark")
    notifications_enabled: bool = Field(default=True)
    google_client_id: Optional[str] = Field(default=None)
    gemini_api_key: Optional[str] = Field(default=None)

class Settings(SettingsBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    
    user: "User" = Relationship(back_populates="settings")

class SettingsCreate(SettingsBase):
    pass

class SettingsUpdate(SQLModel):
    language: Optional[str] = None
    currency: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    google_client_id: Optional[str] = None
    gemini_api_key: Optional[str] = None

class SettingsRead(SettingsBase):
    id: int
    user_id: int
