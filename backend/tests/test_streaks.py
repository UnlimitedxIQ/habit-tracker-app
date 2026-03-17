"""Unit tests for streak calculation logic (no HTTP layer)."""
from datetime import date, timedelta

import pytest

from services.streak_service import get_current_streak, is_completed_today


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _insert_completion(db, habit_id: int, d: date):
    await db.execute(
        "INSERT OR IGNORE INTO completions (habit_id, completed_date) VALUES (?, ?)",
        (habit_id, d.isoformat()),
    )
    await db.commit()


async def _create_habit(db, name: str = "H") -> int:
    cursor = await db.execute(
        "INSERT INTO habits (name, emoji) VALUES (?, '⭐')", (name,)
    )
    await db.commit()
    return cursor.lastrowid


# ---------------------------------------------------------------------------
# is_completed_today
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_not_completed_today_initially(db):
    habit_id = await _create_habit(db)
    assert await is_completed_today(db, habit_id) is False


@pytest.mark.asyncio
async def test_completed_today_after_insert(db):
    habit_id = await _create_habit(db)
    await _insert_completion(db, habit_id, date.today())
    assert await is_completed_today(db, habit_id) is True


@pytest.mark.asyncio
async def test_yesterday_does_not_count_as_today(db):
    habit_id = await _create_habit(db)
    yesterday = date.today() - timedelta(days=1)
    await _insert_completion(db, habit_id, yesterday)
    assert await is_completed_today(db, habit_id) is False


# ---------------------------------------------------------------------------
# get_current_streak — basic cases
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_streak_zero_no_completions(db):
    habit_id = await _create_habit(db)
    assert await get_current_streak(db, habit_id) == 0


@pytest.mark.asyncio
async def test_streak_one_today(db):
    habit_id = await _create_habit(db)
    await _insert_completion(db, habit_id, date.today())
    assert await get_current_streak(db, habit_id) == 1


@pytest.mark.asyncio
async def test_streak_one_yesterday(db):
    """Streak counts if the last completion was yesterday (not broken yet)."""
    habit_id = await _create_habit(db)
    yesterday = date.today() - timedelta(days=1)
    await _insert_completion(db, habit_id, yesterday)
    assert await get_current_streak(db, habit_id) == 1


@pytest.mark.asyncio
async def test_streak_consecutive_days(db):
    habit_id = await _create_habit(db)
    today = date.today()
    for i in range(5):
        await _insert_completion(db, habit_id, today - timedelta(days=i))
    assert await get_current_streak(db, habit_id) == 5


@pytest.mark.asyncio
async def test_streak_breaks_on_gap(db):
    """A gap in completions resets the streak to the recent run."""
    habit_id = await _create_habit(db)
    today = date.today()
    # today + yesterday → streak 2, but 3 days ago breaks the chain
    await _insert_completion(db, habit_id, today)
    await _insert_completion(db, habit_id, today - timedelta(days=1))
    await _insert_completion(db, habit_id, today - timedelta(days=3))  # gap!
    assert await get_current_streak(db, habit_id) == 2


@pytest.mark.asyncio
async def test_streak_old_completion_no_streak(db):
    """A completion two days ago with no yesterday/today gives streak 0."""
    habit_id = await _create_habit(db)
    two_days_ago = date.today() - timedelta(days=2)
    await _insert_completion(db, habit_id, two_days_ago)
    assert await get_current_streak(db, habit_id) == 0


@pytest.mark.asyncio
async def test_streak_multiple_habits_independent(db):
    """Streak for one habit must not bleed into another."""
    h1 = await _create_habit(db, "H1")
    h2 = await _create_habit(db, "H2")

    today = date.today()
    for i in range(3):
        await _insert_completion(db, h1, today - timedelta(days=i))

    assert await get_current_streak(db, h1) == 3
    assert await get_current_streak(db, h2) == 0
