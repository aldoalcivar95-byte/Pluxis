"""add password reset fields

Revision ID: e72217f8679a
Revises: 6afcd2846c1d
Create Date: 2026-10-06 10:32:15.814351

"""
from alembic import op
import sqlalchemy as sa

revision = 'e72217f8679a'
down_revision = '6afcd2846c1d'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('reset_token', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('reset_token_expires', sa.DateTime(), nullable=True))
        batch_op.create_unique_constraint(None, ['reset_token'])

def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='unique')
        batch_op.drop_column('reset_token_expires')
        batch_op.drop_column('reset_token')

