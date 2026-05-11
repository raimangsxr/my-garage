from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
from contextlib import contextmanager
from sqlalchemy import event
from pgvector.psycopg2 import register_vector

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)


@event.listens_for(engine, "connect")
def register_pgvector(dbapi_connection, connection_record):
    try:
        register_vector(dbapi_connection)
    except Exception:
        # The extension may not be installed yet during early migrations.
        pass

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

@contextmanager
def get_db_context():
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
