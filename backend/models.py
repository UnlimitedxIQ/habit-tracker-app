from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Habit models
# ---------------------------------------------------------------------------


class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    emoji: str = Field(default="⭐")

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("name cannot be blank")
        return stripped


class HabitUpdate(BaseModel):
    # Both fields are optional — an empty body is accepted as a no-op.
    # The service layer only updates fields that are not None.
    name: str | None = Field(default=None, min_length=1, max_length=100)
    emoji: str | None = None

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, v: str | None) -> str | None:
        if v is None:
            return None
        stripped = v.strip()
        if not stripped:
            raise ValueError("name cannot be blank")
        return stripped


class HabitResponse(BaseModel):
    id: int
    name: str
    emoji: str
    created_at: str
    current_streak: int
    completed_today: bool


# ---------------------------------------------------------------------------
# Completion models
# ---------------------------------------------------------------------------


class ToggleRequest(BaseModel):
    # If omitted, the endpoint defaults to today's date.
    date: str | None = None


class ToggleResponse(BaseModel):
    habit_id: int
    date: str
    completed: bool
    current_streak: int


# ---------------------------------------------------------------------------
# Weekly heatmap models
# ---------------------------------------------------------------------------


class WeeklyHabitData(BaseModel):
    habit_id: int
    name: str
    emoji: str
    # Keys are 'YYYY-MM-DD' strings; values are True/False.
    completions: dict[str, bool]


class WeeklyResponse(BaseModel):
    week_start: str   # 'YYYY-MM-DD' (Monday)
    week_end: str     # 'YYYY-MM-DD' (Sunday)
    habits: list[WeeklyHabitData]
