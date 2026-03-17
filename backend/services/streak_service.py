from datetime import date, timedelta

import aiosqlite

from models import WeeklyHabitData, WeeklyResponse


async def get_current_streak(db: aiosqlite.Connection, habit_id: int) -> int:
    """Count consecutive completed days ending today or yesterday."""
    rows = await db.execute_fetchall(
        "SELECT completed_date FROM completions "
        "WHERE habit_id = ? ORDER BY completed_date DESC LIMIT 365",
        (habit_id,),
    )
    if not rows:
        return 0

    dates = {row[0] for row in rows}
    today = date.today()
    check = today if today.isoformat() in dates else today - timedelta(days=1)

    streak = 0
    while check.isoformat() in dates:
        streak += 1
        check -= timedelta(days=1)
    return streak


async def is_completed_today(db: aiosqlite.Connection, habit_id: int) -> bool:
    """Return True if the habit has a completion row for today."""
    today = date.today().isoformat()
    rows = await db.execute_fetchall(
        "SELECT 1 FROM completions WHERE habit_id = ? AND completed_date = ?",
        (habit_id, today),
    )
    return bool(rows)


async def toggle_completion(
    db: aiosqlite.Connection, habit_id: int, date_str: str
) -> bool:
    """Insert or delete the completion for (habit_id, date_str).

    Returns True if the habit is now completed on that date, False if uncompleted.
    """
    existing = await db.execute_fetchall(
        "SELECT 1 FROM completions WHERE habit_id = ? AND completed_date = ?",
        (habit_id, date_str),
    )
    if existing:
        await db.execute(
            "DELETE FROM completions WHERE habit_id = ? AND completed_date = ?",
            (habit_id, date_str),
        )
        await db.commit()
        return False
    else:
        await db.execute(
            "INSERT INTO completions (habit_id, completed_date) VALUES (?, ?)",
            (habit_id, date_str),
        )
        await db.commit()
        return True


async def get_weekly_completions(
    db: aiosqlite.Connection, week_start: date
) -> WeeklyResponse:
    """Return completion status for every habit across a Monday–Sunday week.

    ``week_start`` must be a Monday (the caller is responsible for this).
    """
    week_end = week_start + timedelta(days=6)
    week_dates = [
        (week_start + timedelta(days=i)).isoformat() for i in range(7)
    ]

    habits = await db.execute_fetchall(
        "SELECT id, name, emoji FROM habits ORDER BY created_at ASC"
    )

    completions = await db.execute_fetchall(
        "SELECT habit_id, completed_date FROM completions "
        "WHERE completed_date BETWEEN ? AND ?",
        (week_start.isoformat(), week_end.isoformat()),
    )
    # Build a lookup set: {(habit_id, date_str)}
    done: set[tuple[int, str]] = {(row[0], row[1]) for row in completions}

    habit_data = [
        WeeklyHabitData(
            habit_id=habit[0],
            name=habit[1],
            emoji=habit[2],
            completions={d: (habit[0], d) in done for d in week_dates},
        )
        for habit in habits
    ]

    return WeeklyResponse(
        week_start=week_start.isoformat(),
        week_end=week_end.isoformat(),
        habits=habit_data,
    )
