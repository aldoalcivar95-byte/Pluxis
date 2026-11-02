"""add event coordinates

Revision ID: cd603d23c893
Revises: e72217f8679a
Create Date: 2026-10-18 12:34:37.498810

"""
from alembic import op
import sqlalchemy as sa

revision = 'cd603d23c893'
down_revision = 'e72217f8679a'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.add_column(sa.Column('latitude', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('longitude', sa.Float(), nullable=True))

def downgrade():
    with op.batch_alter_table('event', schema=None) as batch_op:
        batch_op.drop_column('longitude')
        batch_op.drop_column('latitude')

