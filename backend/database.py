import os
from pathlib import Path
from typing import AsyncGenerator

import aiosqlite

# Vercel serverless: only /tmp is writable; locally use the backend/ directory.
_DEFAULT_DB = "/tmp/habits.db" if os.environ.get("VERCEL") else str(Path(__file__).parent / "habits.db")
DB_PATH: str = os.environ.get("DATABASE_URL", _DEFAULT_DB)

# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------

_CREATE_HABITS = """
CREATE TABLE IF NOT EXISTS habits (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    emoji       TEXT    NOT NULL DEFAULT '⭐',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
)
"""

_CREATE_COMPLETIONS = """
CREATE TABLE IF NOT EXISTS completions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id        INTEGER NOT NULL,
    completed_date  TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, completed_date)
)
"""

_CREATE_INDEX = """
CREATE INDEX IF NOT EXISTS idx_completions_habit_date
    ON completions(habit_id, completed_date)
"""

# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def init_db() -> None:
    """Create tables and index on startup. Fails fast if the DB is inaccessible."""
    async with aiosqlite.connect(DB_PATH) as db:
        # WAL mode persists on the file — only needs to be set once,
        # but setting it again on an already-WAL file is a harmless no-op.
        await db.execute("PRAGMA journal_mode=WAL")
        # Foreign key enforcement is per-connection; set it here too so
        # the CASCADE on completions works during the integrity check below.
        await db.execute("PRAGMA foreign_keys=ON")
        await db.execute(_CREATE_HABITS)
        await db.execute(_CREATE_COMPLETIONS)
        await db.execute(_CREATE_INDEX)
        await db.commit()


async def get_db() -> AsyncGenerator[aiosqlite.Connection, None]:
    """FastAPI dependency: yields an open, configured DB connection per request."""
    async with aiosqlite.connect(DB_PATH) as db:
        # Must be set on every connection — SQLite does not persist this flag.
        await db.execute("PRAGMA foreign_keys=ON")
        # Row factory gives dict-like access: row["name"] and dict(row) both work.
        db.row_factory = aiosqlite.Row
        yield db
