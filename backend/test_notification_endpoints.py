from datetime import date, timedelta

from sqlmodel import select

from app.models import Notification, Vehicle
from test_api_helpers import api_test_context, create_user


def test_read_notifications_returns_only_current_user_notifications_and_total_header():
    with api_test_context() as ctx:
        ctx.session.add(
            Notification(
                user_id=ctx.user.id,
                title="Vehicle reminder",
                message="Message",
                type="GENERAL",
            )
        )
        ctx.session.commit()

        response = ctx.client.get("/api/v1/notifications", headers=ctx.auth_headers())

    assert response.status_code == 200
    assert response.headers["X-Total-Count"] == "1"
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["title"] == "Vehicle reminder"


def test_mark_notification_read_and_unread_updates_state_for_owner():
    with api_test_context() as ctx:
        notification = Notification(
            user_id=ctx.user.id,
            title="ITV Due",
            message="Soon",
            type="ITV",
        )
        ctx.session.add(notification)
        ctx.session.commit()
        ctx.session.refresh(notification)

        read_response = ctx.client.put(
            f"/api/v1/notifications/{notification.id}/read",
            headers=ctx.auth_headers(),
        )
        unread_response = ctx.client.put(
            f"/api/v1/notifications/{notification.id}/unread",
            headers=ctx.auth_headers(),
        )

    assert read_response.status_code == 200
    assert read_response.json()["is_read"] is True
    assert unread_response.status_code == 200
    assert unread_response.json()["is_read"] is False


def test_mark_notification_read_rejects_non_owner():
    with api_test_context() as ctx:
        other_user = create_user(ctx.session)
        notification = Notification(
            user_id=other_user.id,
            title="Private notification",
            message="Forbidden",
            type="GENERAL",
        )
        ctx.session.add(notification)
        ctx.session.commit()
        ctx.session.refresh(notification)

        response = ctx.client.put(
            f"/api/v1/notifications/{notification.id}/read",
            headers=ctx.auth_headers(),
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Not enough permissions"


def test_mark_notification_unread_returns_not_found_for_missing_id():
    with api_test_context() as ctx:
        response = ctx.client.put("/api/v1/notifications/9999/unread", headers=ctx.auth_headers())

    assert response.status_code == 404
    assert response.json()["detail"] == "Notification not found"


def test_check_notifications_generates_due_date_notifications_once_per_day():
    today = date.today()
    with api_test_context() as ctx:
        vehicle = Vehicle(
            brand="Ducati",
            model="Monster",
            year=2022,
            license_plate="ABC123",
            kilometers=1500,
            next_itv_date=today + timedelta(days=7),
            next_insurance_date=today + timedelta(days=10),
            next_road_tax_date=today + timedelta(days=12),
        )
        ctx.session.add(vehicle)
        ctx.session.commit()

        first_response = ctx.client.post("/api/v1/notifications/check", headers=ctx.auth_headers())
        second_response = ctx.client.post("/api/v1/notifications/check", headers=ctx.auth_headers())

        notifications = ctx.session.exec(select(Notification)).all()

    assert first_response.status_code == 200
    assert first_response.json()["message"] == "Check complete. Generated 3 notifications."
    assert second_response.status_code == 200
    assert second_response.json()["message"] == "Check complete. Generated 0 notifications."
    assert len(notifications) == 3
