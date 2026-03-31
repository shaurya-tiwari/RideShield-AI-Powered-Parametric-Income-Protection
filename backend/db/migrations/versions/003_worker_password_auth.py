"""Add worker password hash for password-based login

Revision ID: 003
Revises: 002
Create Date: 2026-03-31
"""

from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("workers", sa.Column("password_hash", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("workers", "password_hash")
