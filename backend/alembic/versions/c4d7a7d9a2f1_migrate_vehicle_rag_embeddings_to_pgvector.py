"""migrate vehicle rag embeddings to pgvector

Revision ID: c4d7a7d9a2f1
Revises: b3f1c7c9d2e4
Create Date: 2026-05-11 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import VECTOR


# revision identifiers, used by Alembic.
revision: str = "c4d7a7d9a2f1"
down_revision: Union[str, Sequence[str], None] = "b3f1c7c9d2e4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Derived RAG data is rebuildable from source documents, so reset it cleanly.
    op.execute("DELETE FROM vehicleknowledgefact")
    op.execute("DELETE FROM vehicledocumentchunk")
    op.execute(
        """
        UPDATE vehicledocument
        SET extracted_text = NULL,
            error_message = NULL,
            chunk_count = 0,
            indexed_at = NULL,
            status = 'uploaded',
            updated_at = NOW()
        """
    )

    op.drop_column("vehicledocumentchunk", "embedding")
    op.add_column("vehicledocumentchunk", sa.Column("embedding", VECTOR(256), nullable=False))
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_vehicledocumentchunk_embedding_hnsw "
        "ON vehicledocumentchunk USING hnsw (embedding vector_cosine_ops)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_vehicledocumentchunk_embedding_hnsw")

    # Reset rebuildable derived data again to avoid invalid carryover between types.
    op.execute("DELETE FROM vehicleknowledgefact")
    op.execute("DELETE FROM vehicledocumentchunk")
    op.execute(
        """
        UPDATE vehicledocument
        SET extracted_text = NULL,
            error_message = NULL,
            chunk_count = 0,
            indexed_at = NULL,
            status = 'uploaded',
            updated_at = NOW()
        """
    )

    op.drop_column("vehicledocumentchunk", "embedding")
    op.add_column("vehicledocumentchunk", sa.Column("embedding", sa.JSON(), nullable=False))
