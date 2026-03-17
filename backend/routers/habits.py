from fastapi import APIRouter, Depends, Response
from fastapi.responses import JSONResponse

import aiosqlite

from database import get_db
from models import HabitCreate, HabitResponse, HabitUpdate
from services import habit_service

router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=list[HabitResponse])
async def list_habits(db: aiosqlite.Connection = Depends(get_db)):
    return await habit_service.get_all(db)


@router.post("", response_model=HabitResponse, status_code=201)
async def create_habit(
    payload: HabitCreate,
    db: aiosqlite.Connection = Depends(get_db),
):
    return await habit_service.create_habit(db, payload)


@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: int,
    payload: HabitUpdate,
    db: aiosqlite.Connection = Depends(get_db),
):
    # habit_service.update_habit raises 404 if habit not found
    return await habit_service.update_habit(db, habit_id, payload)


@router.delete("/{habit_id}", status_code=204)
async def delete_habit(
    habit_id: int,
    db: aiosqlite.Connection = Depends(get_db),
):
    # habit_service.delete_habit raises 404 if habit not found
    await habit_service.delete_habit(db, habit_id)
    return Response(status_code=204)
