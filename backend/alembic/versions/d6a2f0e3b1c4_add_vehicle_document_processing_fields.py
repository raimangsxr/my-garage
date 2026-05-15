"""add vehicle document processing fields

Revision ID: d6a2f0e3b1c4
Revises: c4d7a7d9a2f1
Create Date: 2026-05-13 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "d6a2f0e3b1c4"
down_revision: Union[str, Sequence[str], None] = "c4d7a7d9a2f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "vehicledocument",
        sa.Column("deletion_requested", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        "vehicledocument",
        sa.Column("processing_progress", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "vehicledocument",
        sa.Column("processing_stage", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
    )
    op.add_column(
        "vehicledocument",
        sa.Column("processing_detail", sa.Text(), nullable=True),
    )

    op.execute(
        """
        UPDATE vehicledocument
        SET processing_progress = CASE
                WHEN status = 'ready' THEN 100
                WHEN status = 'failed' THEN 0
                ELSE 0
            END,
            processing_stage = CASE
                WHEN status = 'ready' THEN 'ready'
                WHEN status = 'failed' THEN 'failed'
                ELSE 'uploaded'
            END,
            processing_detail = CASE
                WHEN status = 'ready' THEN 'Document indexed and ready for chat.'
                WHEN status = 'failed' THEN 'Processing failed. Review the error message and retry.'
                ELSE 'Upload complete. Waiting for indexing to start.'
            END
        """
    )

    op.alter_column("vehicledocument", "processing_progress", server_default=None)
    op.alter_column("vehicledocument", "deletion_requested", server_default=None)


def downgrade() -> None:
    op.drop_column("vehicledocument", "processing_detail")
    op.drop_column("vehicledocument", "processing_stage")
    op.drop_column("vehicledocument", "processing_progress")
    op.drop_column("vehicledocument", "deletion_requested")
