"""add vehicle document rag tables

Revision ID: b3f1c7c9d2e4
Revises: a7b3c1d9e2f4
Create Date: 2026-05-09 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = "b3f1c7c9d2e4"
down_revision: Union[str, Sequence[str], None] = "a7b3c1d9e2f4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "vehicledocument",
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("document_type", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("mime_type", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("file_url", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("file_name", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("included_in_rag", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("extracted_text", sa.Text(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("chunk_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("indexed_at", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicle.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vehicledocument_vehicle_id"), "vehicledocument", ["vehicle_id"], unique=False)
    op.create_index(op.f("ix_vehicledocument_document_type"), "vehicledocument", ["document_type"], unique=False)
    op.create_index(op.f("ix_vehicledocument_status"), "vehicledocument", ["status"], unique=False)
    op.create_index(op.f("ix_vehicledocument_included_in_rag"), "vehicledocument", ["included_in_rag"], unique=False)

    op.create_table(
        "vehicledocumentchunk",
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("page_number", sa.Integer(), nullable=True),
        sa.Column("source_label", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", sa.JSON(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["vehicledocument.id"]),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicle.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vehicledocumentchunk_document_id"), "vehicledocumentchunk", ["document_id"], unique=False)
    op.create_index(op.f("ix_vehicledocumentchunk_vehicle_id"), "vehicledocumentchunk", ["vehicle_id"], unique=False)
    op.create_index(op.f("ix_vehicledocumentchunk_chunk_index"), "vehicledocumentchunk", ["chunk_index"], unique=False)

    op.create_table(
        "vehicleknowledgefact",
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=True),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("category", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_excerpt", sa.Text(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("is_hidden", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["vehicledocument.id"]),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicle.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vehicleknowledgefact_vehicle_id"), "vehicleknowledgefact", ["vehicle_id"], unique=False)
    op.create_index(op.f("ix_vehicleknowledgefact_document_id"), "vehicleknowledgefact", ["document_id"], unique=False)
    op.create_index(op.f("ix_vehicleknowledgefact_category"), "vehicleknowledgefact", ["category"], unique=False)
    op.create_index(op.f("ix_vehicleknowledgefact_is_hidden"), "vehicleknowledgefact", ["is_hidden"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_vehicleknowledgefact_is_hidden"), table_name="vehicleknowledgefact")
    op.drop_index(op.f("ix_vehicleknowledgefact_category"), table_name="vehicleknowledgefact")
    op.drop_index(op.f("ix_vehicleknowledgefact_document_id"), table_name="vehicleknowledgefact")
    op.drop_index(op.f("ix_vehicleknowledgefact_vehicle_id"), table_name="vehicleknowledgefact")
    op.drop_table("vehicleknowledgefact")

    op.drop_index(op.f("ix_vehicledocumentchunk_chunk_index"), table_name="vehicledocumentchunk")
    op.drop_index(op.f("ix_vehicledocumentchunk_vehicle_id"), table_name="vehicledocumentchunk")
    op.drop_index(op.f("ix_vehicledocumentchunk_document_id"), table_name="vehicledocumentchunk")
    op.drop_table("vehicledocumentchunk")

    op.drop_index(op.f("ix_vehicledocument_included_in_rag"), table_name="vehicledocument")
    op.drop_index(op.f("ix_vehicledocument_status"), table_name="vehicledocument")
    op.drop_index(op.f("ix_vehicledocument_document_type"), table_name="vehicledocument")
    op.drop_index(op.f("ix_vehicledocument_vehicle_id"), table_name="vehicledocument")
    op.drop_table("vehicledocument")
