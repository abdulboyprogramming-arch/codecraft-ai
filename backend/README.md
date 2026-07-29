# Database Migrations

This directory contains Alembic migrations for the CodeCraft AI database.

## Setup

Initialize Alembic (if not already done):
```bash
alembic init alembic
```

## Creating a Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Create a blank migration
alembic revision -m "Description of changes"
```

## Running Migrations

```bash
# Upgrade to latest version
alembic upgrade head

# Upgrade to a specific version
alembic upgrade <revision_id>

# Downgrade one version
alembic downgrade -1

# Show current version
alembic current
```

## Migration Structure

Each migration file should contain:

· upgrade(): Forward migration

· downgrade(): Rollback migration

Example Migration

```python
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'example',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('example')
```

## Database Schema

Current schema is managed through SQLAlchemy models in `/backend/app/models/`.

## Version Control

All migration files should be committed to version control.

---

**Developer:** Abdulrahman Adeeyo

**Project:** CodeCraft AI

**Hackathon:** Prometheus July AI Challenge

**Repository:** https://github.com/abdulboyprogramming-arch/codecraft-ai.git
