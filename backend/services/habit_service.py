from datetime import date

import aiosqlite
from fastapi import HTTPException

from models import HabitCreate, HabitResponse, HabitUpdate
from services.streak_service import get_current_streak, is_completed_today


async def create_habit(db: aiosqlite.Connection, payload: HabitCreate) -> HabitResponse:
    """Insert a new habit and return it with streak/today status."""
    cursor = await db.execute(
        "INSERT INTO habits (name, emoji) VALUES (?, ?)",
        (payload.name, payload.emoji),
    )
    await db.commit()
    habit_id = cursor.lastrowid
    return await get_one(db, habit_id)


async def get_all(db: aiosqlite.Connection) -> list[HabitResponse]:
    """Return all habits ordered by creation date, with streaks and today flags."""
    rows = await db.execute_fetchall(
        "SELECT id, name, emoji, created_at FROM habits ORDER BY created_at ASC"
    )
    habits = []
    for row in rows:
        habit_id = row[0]
        streak = await get_current_streak(db, habit_id)
        completed_today = await is_completed_today(db, habit_id)
        habits.append(
            HabitResponse(
                id=habit_id,
                name=row[1],
                emoji=row[2],
                created_at=row[3],
                current_streak=streak,
                completed_today=completed_today,
            )
        )
    return habits


async def get_one(db: aiosqlite.Connection, habit_id: int) -> HabitResponse:
    """Return a single habit by ID, or raise 404."""
    rows = await db.execute_fetchall(
        "SELECT id, name, emoji, created_at FROM habits WHERE id = ?",
        (habit_id,),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Habit not found")
    row = rows[0]
    streak = await get_current_streak(db, habit_id)
    completed_today = await is_completed_today(db, habit_id)
    return HabitResponse(
        id=row[0],
        name=row[1],
        emoji=row[2],
        created_at=row[3],
        current_streak=streak,
        completed_today=completed_today,
    )


async def update_habit(
    db: aiosqlite.Connection, habit_id: int, payload: HabitUpdate
) -> HabitResponse:
    """Partially update a habit's name and/or emoji. Empty body is a no-op."""
    # Ensure the habit exists before attempting an update.
    await get_one(db, habit_id)

    fields = {}
    if payload.name is not None:
        fields["name"] = payload.name
    if payload.emoji is not None:
        fields["emoji"] = payload.emoji

    if fields:
        set_clause = ", ".join(f"{col} = ?" for col in fields)
        values = list(fields.values()) + [date.today().isoformat(), habit_id]
        await db.execute(
            f"UPDATE habits SET {set_clause}, updated_at = ? WHERE id = ?",  # noqa: S608
            values,
        )
        await db.commit()

    return await get_one(db, habit_id)


async def delete_habit(db: aiosqlite.Connection, habit_id: int) -> None:
    """Delete a habit (completions cascade). Raises 404 if not found."""
    await get_one(db, habit_id)
    await db.execute("DELETE FROM habits WHERE id = ?", (habit_id,))
    await db.commit()
