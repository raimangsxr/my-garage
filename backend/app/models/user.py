from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, LargeBinary

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    image_binary: Optional[bytes] = Field(default=None, sa_column=Column(LargeBinary))

class UserRead(UserBase):
    id: int
    image_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    image_url: Optional[str] = None

class UserPasswordUpdate(SQLModel):
    current_password: str
    new_password: str
