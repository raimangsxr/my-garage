from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from app.models.user import User

class NotificationBase(SQLModel):
    title: str
    message: str
    type: str  # ITV, INSURANCE, TAX, GENERAL
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")

class Notification(NotificationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user: Optional["User"] = Relationship()

class NotificationCreate(NotificationBase):
    pass

class NotificationRead(NotificationBase):
    id: int

class NotificationUpdate(SQLModel):
    is_read: Optional[bool] = None
