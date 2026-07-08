from __future__ import annotations

import os
from collections.abc import Generator
from contextlib import contextmanager
from dataclasses import dataclass

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.api import deps
from app.core.security import create_access_token, get_password_hash
from app.main import app
from app.models import Settings, User


@dataclass
class TestApiContext:
    __test__ = False

    client: TestClient
    session: Session
    user: User

    def auth_headers(self, user: User | None = None) -> dict[str, str]:
        current_user = user or self.user
        token = create_access_token(current_user.email)
        return {"Authorization": f"Bearer {token}"}


def _session_override(session: Session):
    def override() -> Generator[Session, None, None]:
        yield session

    return override


@contextmanager
def api_test_context(*, override_current_user: bool = False) -> Generator[TestApiContext, None, None]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        user = User(
            email="tester@example.com",
            full_name="Test User",
            hashed_password=get_password_hash("secret123"),
            is_active=True,
            is_superuser=False,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        app.dependency_overrides[deps.get_db] = _session_override(session)
        app.dependency_overrides[deps.get_session] = _session_override(session)
        if override_current_user:
            app.dependency_overrides[deps.get_current_active_user] = lambda: user

        client = TestClient(app)
        try:
            yield TestApiContext(client=client, session=session, user=user)
        finally:
            app.dependency_overrides.clear()


def create_settings(session: Session, *, user: User, **overrides) -> Settings:
    settings = Settings(
        user_id=user.id,
        language=overrides.get("language", "en"),
        currency=overrides.get("currency", "EUR"),
        theme=overrides.get("theme", "dark"),
        notifications_enabled=overrides.get("notifications_enabled", True),
        google_client_id=overrides.get("google_client_id"),
        gemini_api_key=overrides.get("gemini_api_key"),
    )
    session.add(settings)
    session.commit()
    session.refresh(settings)
    session.refresh(user)
    return settings


def create_user(session: Session, **overrides) -> User:
    user = User(
        email=overrides.get("email", "other@example.com"),
        full_name=overrides.get("full_name", "Other User"),
        hashed_password=get_password_hash(overrides.get("password", "secret123")),
        is_active=overrides.get("is_active", True),
        is_superuser=overrides.get("is_superuser", False),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
