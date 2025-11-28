
from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
from contextlib import contextmanager

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

@contextmanager
def get_db_context():
    """
    Context manager for database sessions in background tasks.
    Automatically commits on success and rolls back on error.
    
    Usage:
        with get_db_context() as session:
            # do database operations
            pass
    """
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
