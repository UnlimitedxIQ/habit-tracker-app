# Database Schema

## SQLite Tables

### habits
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique habit ID |
| name | TEXT | NOT NULL | Habit name (e.g., "Meditate") |
| emoji | TEXT | NOT NULL DEFAULT '⭐' | Emoji icon for the habit |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | ISO 8601 timestamp |
| updated_at | TEXT | NOT NULL DEFAULT (datetime('now')) | ISO 8601 timestamp |

### completions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique completion ID |
| habit_id | INTEGER | NOT NULL, FK → habits(id) ON DELETE CASCADE | Which habit |
| completed_date | TEXT | NOT NULL | Date string 'YYYY-MM-DD' |
| created_at | TEXT | NOT NULL DEFAULT (datetime('now')) | When logged |

**Unique constraint**: `(habit_id, completed_date)` — one completion per habit per day.

## SQL: Create Tables

```sql
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '⭐',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    completed_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_completions_habit_date
    ON completions(habit_id, completed_date);
```

## Streak Calculation Query

```sql
-- Current streak for a given habit_id
-- Counts consecutive days completed ending today (or yesterday if today incomplete)
WITH RECURSIVE streak_days AS (
    -- Anchor: start from today if completed, else yesterday
    SELECT date('now') AS d, 1 AS streak
    WHERE EXISTS (
        SELECT 1 FROM completions
        WHERE habit_id = ? AND completed_date = date('now')
    )
    UNION ALL
    SELECT date('now', '-1 day') AS d, 1 AS streak
    WHERE NOT EXISTS (
        SELECT 1 FROM completions
        WHERE habit_id = ? AND completed_date = date('now')
    )
    AND EXISTS (
        SELECT 1 FROM completions
        WHERE habit_id = ? AND completed_date = date('now', '-1 day')
    )

    UNION ALL

    -- Recursive: go back one day while completed
    SELECT date(d, '-1 day'), streak + 1
    FROM streak_days
    WHERE EXISTS (
        SELECT 1 FROM completions
        WHERE habit_id = ? AND completed_date = date(d, '-1 day')
    )
)
SELECT COALESCE(MAX(streak), 0) AS current_streak FROM streak_days;
```

**Note**: The streak query is complex for raw SQL. In `streak_service.py`, implement this as a Python loop instead — fetch the last 30 completions ordered by date DESC and count consecutive days. Simpler, testable, and avoids SQLite recursive CTE edge cases.

## Simplified Python Streak Logic (Preferred)

```python
async def get_current_streak(db, habit_id: int) -> int:
    """Count consecutive completed days ending today or yesterday."""
    rows = await db.execute_fetchall(
        "SELECT completed_date FROM completions "
        "WHERE habit_id = ? ORDER BY completed_date DESC LIMIT 365",
        (habit_id,)
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
```
