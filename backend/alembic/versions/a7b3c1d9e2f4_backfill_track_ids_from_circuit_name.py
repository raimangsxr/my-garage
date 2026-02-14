"""Backfill track_id from circuit_name

Revision ID: a7b3c1d9e2f4
Revises: 9c5a2b1d4e3f
Create Date: 2026-02-13 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a7b3c1d9e2f4"
down_revision: Union[str, Sequence[str], None] = "9c5a2b1d4e3f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    metadata = sa.MetaData()

    track_table = sa.Table(
        "track",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String),
    )
    trackrecord_table = sa.Table(
        "trackrecord",
        metadata,
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("circuit_name", sa.String),
        sa.Column("track_id", sa.Integer),
    )

    legacy_names_rows = connection.execute(
        sa.select(sa.distinct(trackrecord_table.c.circuit_name)).where(
            trackrecord_table.c.track_id.is_(None),
            trackrecord_table.c.circuit_name.is_not(None),
            trackrecord_table.c.circuit_name != "",
        )
    ).all()
    legacy_names = [row[0] for row in legacy_names_rows]

    for circuit_name in legacy_names:
        track_id = connection.execute(
            sa.select(track_table.c.id).where(track_table.c.name == circuit_name)
        ).scalar_one_or_none()

        if track_id is None:
            insert_result = connection.execute(
                sa.insert(track_table).values(name=circuit_name)
            )
            inserted_pks = insert_result.inserted_primary_key
            if not inserted_pks:
                track_id = connection.execute(
                    sa.select(track_table.c.id).where(track_table.c.name == circuit_name)
                ).scalar_one()
            else:
                track_id = inserted_pks[0]

        connection.execute(
            sa.update(trackrecord_table)
            .where(
                trackrecord_table.c.track_id.is_(None),
                trackrecord_table.c.circuit_name == circuit_name,
            )
            .values(track_id=track_id)
        )


def downgrade() -> None:
    # Data backfill is intentionally not reversed.
    pass
