import base64

from app.models import User
from app.models.settings import Settings
from test_api_helpers import api_test_context, create_settings


def test_read_user_me_returns_current_profile_with_embedded_image_data():
    with api_test_context() as ctx:
        ctx.user.image_binary = b"png-bytes"
        ctx.session.add(ctx.user)
        ctx.session.commit()
        ctx.session.refresh(ctx.user)

        response = ctx.client.get("/api/v1/users/me", headers=ctx.auth_headers())

    assert response.status_code == 200
    payload = response.json()
    assert payload["email"] == "tester@example.com"
    assert payload["full_name"] == "Test User"
    assert payload["image_url"] == (
        "data:image/png;base64," + base64.b64encode(b"png-bytes").decode("utf-8")
    )


def test_update_user_me_updates_full_name_and_base64_avatar():
    raw_image = base64.b64encode(b"avatar-binary").decode("utf-8")

    with api_test_context() as ctx:
        response = ctx.client.put(
            "/api/v1/users/me",
            json={"full_name": "Updated User", "image_url": f"data:image/png;base64,{raw_image}"},
            headers=ctx.auth_headers(),
        )
        ctx.session.refresh(ctx.user)

    assert response.status_code == 200
    payload = response.json()
    assert payload["full_name"] == "Updated User"
    assert ctx.user.full_name == "Updated User"
    assert ctx.user.image_binary == b"avatar-binary"


def test_change_password_requires_current_password_and_updates_hash():
    with api_test_context() as ctx:
        response = ctx.client.post(
            "/api/v1/users/me/password",
            json={"current_password": "secret123", "new_password": "new-secret456"},
            headers=ctx.auth_headers(),
        )
        ctx.session.refresh(ctx.user)

        login_response = ctx.client.post(
            "/api/v1/auth/login/access-token",
            data={"username": "tester@example.com", "password": "new-secret456"},
        )

    assert response.status_code == 200
    assert response.json() == {"message": "Password updated successfully"}
    assert login_response.status_code == 200


def test_get_settings_creates_defaults_when_missing():
    with api_test_context() as ctx:
        response = ctx.client.get("/api/v1/settings", headers=ctx.auth_headers())
        created_settings = ctx.session.get(Settings, response.json()["id"])

    assert response.status_code == 200
    payload = response.json()
    assert payload["user_id"] == ctx.user.id
    assert payload["language"] == "en"
    assert payload["currency"] == "EUR"
    assert created_settings is not None


def test_update_settings_persists_current_user_preferences():
    with api_test_context() as ctx:
        create_settings(ctx.session, user=ctx.user, language="en", currency="EUR")

        response = ctx.client.put(
            "/api/v1/settings",
            json={"language": "es", "currency": "USD", "notifications_enabled": False},
            headers=ctx.auth_headers(),
        )
        ctx.session.refresh(ctx.user)

    assert response.status_code == 200
    payload = response.json()
    assert payload["language"] == "es"
    assert payload["currency"] == "USD"
    assert payload["notifications_enabled"] is False
