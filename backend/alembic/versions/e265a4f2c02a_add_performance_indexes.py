"""add_performance_indexes

Revision ID: e265a4f2c02a
Revises: f6e689ddb42d
Create Date: 2025-11-28 06:59:37.419486

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e265a4f2c02a'
down_revision = 'f6e689ddb42d'
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes on maintenance table
    op.create_index('ix_maintenance_vehicle_id', 'maintenance', ['vehicle_id'])
    op.create_index('ix_maintenance_supplier_id', 'maintenance', ['supplier_id'])
    op.create_index('ix_maintenance_date', 'maintenance', ['date'])
    
    # Add indexes on part table
    op.create_index('ix_part_maintenance_id', 'part', ['maintenance_id'])
    op.create_index('ix_part_supplier_id', 'part', ['supplier_id'])
    op.create_index('ix_part_invoice_id', 'part', ['invoice_id'])
    
    # Add indexes on invoice table
    op.create_index('ix_invoice_vehicle_id', 'invoice', ['vehicle_id'])
    op.create_index('ix_invoice_supplier_id', 'invoice', ['supplier_id'])
    op.create_index('ix_invoice_status', 'invoice', ['status'])
    op.create_index('ix_invoice_date', 'invoice', ['date'])
    
    # Add indexes on trackrecord table
    op.create_index('ix_trackrecord_vehicle_id', 'trackrecord', ['vehicle_id'])
    op.create_index('ix_trackrecord_track_id', 'trackrecord', ['track_id'])
    op.create_index('ix_trackrecord_date_achieved', 'trackrecord', ['date_achieved'])


def downgrade():
    # Remove indexes from trackrecord table
    op.drop_index('ix_trackrecord_date_achieved', 'trackrecord')
    op.drop_index('ix_trackrecord_track_id', 'trackrecord')
    op.drop_index('ix_trackrecord_vehicle_id', 'trackrecord')
    
    # Remove indexes from invoice table
    op.drop_index('ix_invoice_date', 'invoice')
    op.drop_index('ix_invoice_status', 'invoice')
    op.drop_index('ix_invoice_supplier_id', 'invoice')
    op.drop_index('ix_invoice_vehicle_id', 'invoice')
    
    # Remove indexes from part table
    op.drop_index('ix_part_invoice_id', 'part')
    op.drop_index('ix_part_supplier_id', 'part')
    op.drop_index('ix_part_maintenance_id', 'part')
    
    # Remove indexes from maintenance table
    op.drop_index('ix_maintenance_date', 'maintenance')
    op.drop_index('ix_maintenance_supplier_id', 'maintenance')
    op.drop_index('ix_maintenance_vehicle_id', 'maintenance')
