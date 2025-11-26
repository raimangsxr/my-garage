"""Add vehicle usage_type and track_records table

Revision ID: add_usage_type_track_records
Revises: e0e2318c9607
Create Date: 2025-11-23 21:17:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_usage_type_track_records'
down_revision = '66f88dd8b672'  # Updated to latest migration
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add usage_type column to vehicle table
    op.add_column('vehicle', sa.Column('usage_type', sa.String(), nullable=False, server_default='street'))
    
    # Create track_record table
    op.create_table('trackrecord',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('circuit_name', sa.String(), nullable=False),
        sa.Column('best_lap_time', sa.String(), nullable=False),
        sa.Column('date_achieved', sa.Date(), nullable=False),
        sa.Column('weather_conditions', sa.String(), nullable=True),
        sa.Column('tire_compound', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('vehicle_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['vehicle_id'], ['vehicle.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop track_record table
    op.drop_table('trackrecord')
    
    # Remove usage_type column from vehicle table
    op.drop_column('vehicle', 'usage_type')
