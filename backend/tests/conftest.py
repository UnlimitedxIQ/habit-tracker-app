"""Shared pytest fixtures for the habit-tracker backend test suite."""
import sys
import os

# Ensure the backend root is on sys.path so imports resolve correctly
# when pytest is run from anywhere (e.g. project root or backend/).
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

import pytest
import pytest_asyncio
import aiosqlite
import httpx

from database import init_db, get_db
from main import app


@pytest_asyncio.fixture
async def db():
    """Yield a fresh in-memory SQLite connection with schema applied."""
    async with aiosqlite.connect(":memory:") as conn:
        await conn.execute("PRAGMA foreign_keys=ON")
        conn.row_factory = aiosqlite.Row
        # Replay the same DDL that init_db() runs, but against :memory:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS habits (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL,
                emoji       TEXT    NOT NULL DEFAULT '⭐',
                created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
                updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS completions (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                habit_id        INTEGER NOT NULL,
                completed_date  TEXT    NOT NULL,
                created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
                UNIQUE(habit_id, completed_date)
            )
        """)
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_completions_habit_date
                ON completions(habit_id, completed_date)
        """)
        await conn.commit()
        yield conn


@pytest_asyncio.fixture
async def client(db):
    """AsyncClient wired to the FastAPI app with the test DB injected."""

    async def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
