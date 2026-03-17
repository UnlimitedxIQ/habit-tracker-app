# API Routes

**Base URL**: In production via Vercel Services, the backend is at `/server`. Routes below are defined WITHOUT the `/server` prefix — Vercel strips it before forwarding.

For local dev: `http://localhost:8000`

---

## Health Check

### `GET /health`
**Response** `200`:
```json
{ "status": "ok" }
```

---

## Habits

### `GET /habits`
List all habits with current streak and today's completion status.

**Response** `200`:
```json
[
  {
    "id": 1,
    "name": "Meditate",
    "emoji": "🧘",
    "created_at": "2025-01-01T00:00:00",
    "current_streak": 5,
    "completed_today": true
  }
]
```

### `POST /habits`
Create a new habit.

**Request body**:
```json
{
  "name": "Meditate",
  "emoji": "🧘"
}
```

**Response** `201`:
```json
{
  "id": 1,
  "name": "Meditate",
  "emoji": "🧘",
  "created_at": "2025-01-01T00:00:00",
  "current_streak": 0,
  "completed_today": false
}
```

**Errors**: `422` if name missing/empty or exceeds 100 chars.

### `PUT /habits/{habit_id}`
Update a habit's name and/or emoji. Partial update — omitted fields are not changed.

**Request body**:
```json
{
  "name": "Morning Meditation",
  "emoji": "🧘"
}
```

**Response** `200`: Updated habit object (same shape as GET list item).
**Errors**: `404` if habit not found.

### `DELETE /habits/{habit_id}`
Delete a habit and all its completions (CASCADE).

**Response** `204`: No content.
**Errors**: `404` if habit not found.

---

## Completions

### `POST /habits/{habit_id}/toggle`
Toggle today's completion for a habit. If already completed, removes it. If not, adds it.

**Request body** (optional):
```json
{
  "date": "2025-01-15"
}
```
If `date` is omitted, defaults to today.

**Response** `200`:
```json
{
  "habit_id": 1,
  "date": "2025-01-15",
  "completed": true,
  "current_streak": 6
}
```

**Errors**: `404` if habit not found.

### `GET /completions/weekly`
Get all completions for the current week (Mon–Sun) for all habits.

**Response** `200`:
```json
{
  "week_start": "2025-01-13",
  "week_end": "2025-01-19",
  "habits": [
    {
      "habit_id": 1,
      "name": "Meditate",
      "emoji": "🧘",
      "completions": {
        "2025-01-13": true,
        "2025-01-14": true,
        "2025-01-15": false,
        "2025-01-16": false,
        "2025-01-17": false,
        "2025-01-18": false,
        "2025-01-19": false
      }
    }
  ]
}
```

---

## Error Format

All error responses follow:
```json
{
  "detail": "Habit not found"
}
```

Standard FastAPI error format. Validation errors (422) include field-level details.
