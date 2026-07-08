import os
from datetime import datetime, timedelta

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from sqlmodel import select

from app.api.v1.endpoints import auth as auth_endpoints
from app.models import GoogleAuthToken, Settings, User

from test_api_helpers import api_test_context


def test_login_access_token_returns_bearer_token_for_valid_credentials():
    with api_test_context() as ctx:
        response = ctx.client.post(
            "/api/v1/auth/login/access-token",
            data={"username": "tester@example.com", "password": "secret123"},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert isinstance(payload["access_token"], str)
    assert payload["access_token"]


def test_login_access_token_rejects_invalid_credentials():
    with api_test_context() as ctx:
        response = ctx.client.post(
            "/api/v1/auth/login/access-token",
            data={"username": "tester@example.com", "password": "wrong-password"},
        )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_protected_route_requires_authentication_when_no_token_is_present():
    with api_test_context() as ctx:
        response = ctx.client.get("/api/v1/users/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_password_recovery_returns_placeholder_message_for_existing_user():
    with api_test_context() as ctx:
        response = ctx.client.post("/api/v1/auth/password-recovery/tester@example.com")

    assert response.status_code == 200
    assert response.json() == {"msg": "Password recovery email sent"}


def test_google_login_returns_app_token_and_persists_google_auth_record(monkeypatch):
    monkeypatch.setattr(auth_endpoints, "GOOGLE_AUTH_AVAILABLE", True)
    monkeypatch.setattr(
        auth_endpoints.id_token,
        "verify_oauth2_token",
        lambda credential, _request, client_id: {
            "sub": "google-sub-1",
            "email": "google-user@example.com",
            "name": "Google User",
            "picture": "https://example.com/avatar.png",
            "aud": client_id,
        },
    )

    with api_test_context() as ctx:
        settings = Settings(user_id=ctx.user.id, google_client_id="client-123")
        ctx.session.add(settings)
        ctx.session.commit()

        response = ctx.client.post(
            "/api/v1/auth/google/login",
            json={"credential": "fake-google-jwt"},
        )

        google_token = ctx.session.exec(
            select(GoogleAuthToken).where(GoogleAuthToken.google_id == "google-sub-1")
        ).first()
        created_user = ctx.session.exec(
            select(User).where(User.email == "google-user@example.com")
        ).first()

    assert response.status_code == 200
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert payload["user"]["email"] == "google-user@example.com"
    assert payload["user"]["name"] == "Google User"
    assert created_user is not None
    assert google_token is not None
    assert google_token.user_id == created_user.id
    assert google_token.email == "google-user@example.com"
    assert google_token.token_expires_at >= datetime.utcnow() + timedelta(minutes=50)
