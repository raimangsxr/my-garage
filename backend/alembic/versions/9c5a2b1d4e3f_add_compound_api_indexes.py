"""add_compound_api_indexes

Revision ID: 9c5a2b1d4e3f
Revises: e265a4f2c02a
Create Date: 2026-02-13 17:25:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "9c5a2b1d4e3f"
down_revision = "e265a4f2c02a"
branch_labels = None
depends_on = None


def upgrade():
    op.create_index(
        "ix_notification_user_created_at",
        "notification",
        ["user_id", "created_at"],
    )
    op.create_index(
        "ix_trackrecord_track_date",
        "trackrecord",
        ["track_id", "date_achieved"],
    )
    op.create_index(
        "ix_invoice_status_date",
        "invoice",
        ["status", "date"],
    )
    op.create_index(
        "ix_maintenance_vehicle_date",
        "maintenance",
        ["vehicle_id", "date"],
    )


def downgrade():
    op.drop_index("ix_maintenance_vehicle_date", table_name="maintenance")
    op.drop_index("ix_invoice_status_date", table_name="invoice")
    op.drop_index("ix_trackrecord_track_date", table_name="trackrecord")
    op.drop_index("ix_notification_user_created_at", table_name="notification")
