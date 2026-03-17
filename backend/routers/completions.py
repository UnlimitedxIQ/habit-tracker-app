from datetime import date, timedelta

from fastapi import APIRouter, Depends

import aiosqlite

from database import get_db
from models import ToggleRequest, ToggleResponse, WeeklyResponse
from services import habit_service, streak_service

router = APIRouter(tags=["completions"])


@router.post("/habits/{habit_id}/toggle", response_model=ToggleResponse)
async def toggle_completion(
    habit_id: int,
    payload: ToggleRequest = None,
    db: aiosqlite.Connection = Depends(get_db),
):
    # Verify habit exists (raises 404 if not)
    await habit_service.get_one(db, habit_id)

    date_str = (payload.date if payload and payload.date else None) or date.today().isoformat()
    completed = await streak_service.toggle_completion(db, habit_id, date_str)
    current_streak = await streak_service.get_current_streak(db, habit_id)

    return ToggleResponse(
        habit_id=habit_id,
        date=date_str,
        completed=completed,
        current_streak=current_streak,
    )


@router.get("/completions/weekly", response_model=WeeklyResponse)
async def get_weekly(db: aiosqlite.Connection = Depends(get_db)):
    today = date.today()
    # Monday of the current week (weekday() returns 0 for Monday)
    monday = today - timedelta(days=today.weekday())
    return await streak_service.get_weekly_completions(db, monday)
