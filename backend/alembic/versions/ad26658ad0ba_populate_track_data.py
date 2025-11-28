"""Populate track data

Revision ID: ad26658ad0ba
Revises: ffe36452ca1e
Create Date: 2025-11-26 13:39:43.907347

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad26658ad0ba'
down_revision: Union[str, Sequence[str], None] = 'ffe36452ca1e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    track_table = sa.Table(
        'track',
        sa.MetaData(),
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String),
        sa.Column('location', sa.String),
        sa.Column('length_meters', sa.Integer),
        sa.Column('image_url', sa.String),
        sa.Column('description', sa.String),
    )

    tracks_data = [
        {
            "name": "Circuit de Barcelona-Catalunya",
            "location": "Montmeló, Spain",
            "length_meters": 4657,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/20/Catalunya.svg"
        },
        {
            "name": "Circuito de Jerez",
            "location": "Jerez de la Frontera, Spain",
            "length_meters": 4423,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Jerez.svg"
        },
        {
            "name": "Circuit Ricardo Tormo",
            "location": "Cheste, Spain",
            "length_meters": 4005,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/14/Valencia_%28Ricardo_Tormo%29_track_map.svg"
        },
        {
            "name": "Circuito del Jarama",
            "location": "San Sebastián de los Reyes, Spain",
            "length_meters": 3850,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/22/Jarama.svg"
        },
        {
            "name": "Motorland Aragón",
            "location": "Alcañiz, Spain",
            "length_meters": 5344,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Motorland_Arag%C3%B3n_FIA.svg"
        },
        {
            "name": "Circuit de Catalunya",
            "location": "Montmeló, Spain",
            "length_meters": 4657,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/20/Catalunya.svg"
        },
        {
            "name": "Portimão",
            "location": "Portimão, Portugal",
            "length_meters": 4653,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/65/Aut%C3%B3dromo_do_Algarve_alt.svg"
        },
        {
            "name": "Estoril",
            "location": "Alcabideche, Portugal",
            "length_meters": 4182,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Estoril_track_map.svg"
        },
        {
            "name": "Monza",
            "location": "Monza, Italy",
            "length_meters": 5793,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/56/Monza_track_map.svg"
        },
        {
            "name": "Spa-Francorchamps",
            "location": "Stavelot, Belgium",
            "length_meters": 7004,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/54/Spa-Francorchamps_of_Belgium.svg"
        },
        {
            "name": "Nürburgring",
            "location": "Nürburg, Germany",
            "length_meters": 5148,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/ca/N%C3%BCrburgring_-_Grand-Prix-Strecke.svg"
        },
        {
            "name": "Mugello",
            "location": "Scarperia e San Piero, Italy",
            "length_meters": 5245,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/0/02/Mugello_Racing_Circuit_track_map.svg"
        },
        {
            "name": "Paul Ricard",
            "location": "Le Castellet, France",
            "length_meters": 5842,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Paul_Ricard.svg"
        },
        {
            "name": "Imola",
            "location": "Imola, Italy",
            "length_meters": 4909,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/4/46/Imola.svg"
        },
        {
            "name": "Red Bull Ring",
            "location": "Spielberg, Austria",
            "length_meters": 4318,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Circuit_Red_Bull_Ring.svg"
        },
        {
            "name": "Zandvoort",
            "location": "Zandvoort, Netherlands",
            "length_meters": 4259,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Zandvoort.svg"
        },
        {
            "name": "Silverstone",
            "location": "Silverstone, UK",
            "length_meters": 5891,
            "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/90/Silverstone_Circuit_vector_map.png"
        }
    ]

    for track in tracks_data:
        # Check if exists
        select_stmt = sa.select(track_table.c.id).where(track_table.c.name == track['name'])
        result = connection.execute(select_stmt).first()
        
        if result:
            # Update
            update_stmt = (
                sa.update(track_table)
                .where(track_table.c.name == track['name'])
                .values(
                    location=track['location'],
                    length_meters=track['length_meters'],
                    image_url=track['image_url']
                )
            )
            connection.execute(update_stmt)
        else:
            # Insert
            insert_stmt = sa.insert(track_table).values(
                name=track['name'],
                location=track['location'],
                length_meters=track['length_meters'],
                image_url=track['image_url']
            )
            connection.execute(insert_stmt)


def downgrade() -> None:
    """Downgrade schema."""
    pass
