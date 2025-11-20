from sqlmodel import SQLModel, create_engine, Session
from typing import Generator

import os

# Default to local PostgreSQL if DATABASE_URL is not set
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://adminuser:z^Lg!%Bhg1QIV$@192.168.11.21:5432/mygarage_dev")

engine = create_engine(DATABASE_URL, echo=True)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
