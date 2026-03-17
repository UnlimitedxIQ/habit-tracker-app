# Build Instructions — Habit Tracker

Ordered build steps. Each step must complete before dependent steps begin.

---

## Step 1: Project scaffolding & Vercel Services config
**Files:** `vercel.json`, `.gitignore`, `backend/requirements.txt`, `backend/pyproject.toml`, `backend/main.py`
**Description:**
- Create root `vercel.json` with `experimentalServices` config:
  - `web`: entrypoint `apps/web`, routePrefix `/`
  - `api`: entrypoint `backend/main.py`, routePrefix `/server`
- Create root `.gitignore` covering Python (`__pycache__/`, `*.pyc`, `.venv/`, `*.db`) and Node (`node_modules/`, `.next/`, `.env*.local`).
- Create `backend/requirements.txt`: `fastapi`, `uvicorn[standard]`, `aiosqlite`, `pydantic>=2.0`.
- Create `backend/pyproject.toml` with project metadata and Python 3.12+ requirement.
- Create `backend/main.py` with a minimal FastAPI app:
  - Import FastAPI, add CORS middleware allowing `http://localhost:3000` and `*` origins (dev only).
  - Add a `GET /health` endpoint returning `{"status": "ok"}`.
  - Add lifespan handler that initializes the database on startup.

**Done when:** `cd backend && pip install -r requirements.txt && uvicorn main:app --port 8000` starts and `GET http://localhost:8000/health` returns `{"status": "ok"}`.
**Depends on:** nothing

---

## Step 2: Database layer
**Files:** `backend/database.py`
**Description:**
- Create async SQLite connection using `aiosqlite`.
- Implement `init_db()` function that creates `habits` and `completions` tables with the exact SQL from `schema.md` (including `PRAGMA journal_mode=WAL` and `PRAGMA foreign_keys=ON`).
- Implement `get_db()` async dependency that yields a database connection.
- Database file path: `backend/habits.db` (or configurable via env var).

**Done when:** Importing `database.py` and calling `init_db()` creates the SQLite file with both tables and the index.
**Depends on:** Step 1

---

## Step 3: Pydantic models
**Files:** `backend/models.py`
**Description:**
Define Pydantic v2 models:
- `HabitCreate(BaseModel)`: `name: str` (min_length=1, max_length=100), `emoji: str = "⭐"`
- `HabitUpdate(BaseModel)`: `name: str | None = None`, `emoji: str | None = None`
- `HabitResponse(BaseModel)`: `id: int`, `name: str`, `emoji: str`, `created_at: str`, `current_streak: int`, `completed_today: bool`
- `ToggleRequest(BaseModel)`: `date: str | None = None`
- `ToggleResponse(BaseModel)`: `habit_id: int`, `date: str`, `completed: bool`, `current_streak: int`
- `WeeklyHabitData(BaseModel)`: `habit_id: int`, `name: str`, `emoji: str`, `completions: dict[str, bool]`
- `WeeklyResponse(BaseModel)`: `week_start: str`, `week_end: str`, `habits: list[WeeklyHabitData]`

**Done when:** All models import cleanly and validate sample data without errors.
**Depends on:** Step 1

---

## Step 4: Service layer (business logic)
**Files:** `backend/services/__init__.py`, `backend/services/habit_service.py`, `backend/services/streak_service.py`
**Description:**
- `habit_service.py`:
  - `create_habit(db, data: HabitCreate) -> dict` — INSERT and return new row.
  - `get_all_habits(db) -> list[dict]` — SELECT all habits with streak + today's completion.
  - `get_habit(db, habit_id: int) -> dict | None` — SELECT single habit.
  - `update_habit(db, habit_id: int, data: HabitUpdate) -> dict | None` — UPDATE fields that are not None, return updated row.
  - `delete_habit(db, habit_id: int) -> bool` — DELETE, return success.
- `streak_service.py`:
  - `get_current_streak(db, habit_id: int) -> int` — Use Python loop approach (see `schema.md` "Simplified Python Streak Logic"): fetch last 365 completions, count consecutive days back from today/yesterday.
  - `is_completed_today(db, habit_id: int) -> bool` — Check completions for today.
  - `toggle_completion(db, habit_id: int, date_str: str) -> bool` — INSERT or DELETE completion row, return new completed state.
  - `get_weekly_completions(db) -> dict` — Query all completions for current Mon–Sun week, build the WeeklyResponse structure.

**Done when:** Each service function works against a test SQLite database.
**Depends on:** Steps 2, 3

---

## Step 5: API routers
**Files:** `backend/routers/__init__.py`, `backend/routers/habits.py`, `backend/routers/completions.py`
**Description:**
- `habits.py` — APIRouter with prefix `/habits`:
  - `GET /` → list all habits (calls `get_all_habits`)
  - `POST /` → create habit (calls `create_habit`, returns 201)
  - `PUT /{habit_id}` → update habit (calls `update_habit`, 404 if not found)
  - `DELETE /{habit_id}` → delete habit (calls `delete_habit`, 204 on success, 404 if not found)
- `completions.py` — APIRouter:
  - `POST /habits/{habit_id}/toggle` → toggle completion (calls `toggle_completion`, 404 if habit not found)
  - `GET /completions/weekly` → get weekly data for all habits
- Register both routers in `main.py`.
- Note: Routes do NOT include `/server` prefix — Vercel strips it.

**Done when:** All endpoints respond correctly when tested with `curl` or the FastAPI Swagger UI at `http://localhost:8000/docs`.
**Depends on:** Step 4

---

## Step 6: Backend tests
**Files:** `backend/tests/__init__.py`, `backend/tests/conftest.py`, `backend/tests/test_habits.py`, `backend/tests/test_completions.py`, `backend/tests/test_streaks.py`
**Description:**
- `conftest.py`: Shared fixtures — in-memory SQLite database, async httpx client for FastAPI app.
- `test_habits.py`: Test CRUD — create, list, update (partial), delete, 404 handling, validation errors.
- `test_completions.py`: Test toggle (add + remove), weekly endpoint structure and data.
- `test_streaks.py`: Test streak calculation for consecutive days, gaps, starting from yesterday, and empty history.
- Add `pytest`, `pytest-asyncio`, and `httpx` to `requirements.txt`.

**Done when:** `cd backend && pytest -v` passes with 80%+ coverage.
**Depends on:** Step 5

---

## Step 7: Frontend scaffolding
**Files:** `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/next.config.ts`, `apps/web/postcss.config.mjs`, `apps/web/components.json`, `apps/web/app/layout.tsx`, `apps/web/app/globals.css`, `apps/web/app/loading.tsx`, `apps/web/public/favicon.ico`
**Description:**
- Initialize Next.js 16 project in `apps/web/` with TypeScript, Tailwind CSS, App Router.
- Configure `next.config.ts` (no special config needed for MVP).
- Set up `postcss.config.mjs` for Tailwind.
- Create `globals.css` with:
  - Tailwind directives
  - Custom CSS properties from vision.md (--color-primary, --color-bg, --color-surface, etc.)
  - `fadeInUp` keyframe animation
  - Dark theme as default (background #0C0F0A, text #F0F4E8)
- Configure shadcn/ui (`components.json` with custom color config and `components/ui` path).
- Install shadcn/ui components: Card, Button, Input, Sheet, Dialog, AlertDialog, DropdownMenu, Badge, Tooltip.
- Create `layout.tsx` with:
  - Fonts loaded via `next/font/google`: Sora, DM Sans, JetBrains Mono
  - CSS variables for font families on `<body>`
  - Dark `<html>` class, TooltipProvider wrapper
  - Max-width container `max-w-4xl mx-auto px-6 py-10`
- Create `loading.tsx` with skeleton cards (pulsing placeholders).

**Done when:** `cd apps/web && npm run dev` starts and shows a dark page with the correct fonts at `http://localhost:3000`.
**Depends on:** nothing (parallel with backend steps)

---

## Step 8: API client, types & hooks
**Files:** `apps/web/lib/types.ts`, `apps/web/lib/api.ts`, `apps/web/lib/utils.ts`, `apps/web/hooks/use-habits.ts`, `apps/web/hooks/use-weekly.ts`
**Description:**
- `types.ts`: TypeScript interfaces matching all Pydantic response models (`Habit`, `ToggleResponse`, `WeeklyHabitData`, `WeeklyData`).
- `api.ts`: Fetch wrapper functions:
  - `API_URL` from `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)
  - `fetchHabits()`, `createHabit(data)`, `updateHabit(id, data)`, `deleteHabit(id)`
  - `toggleCompletion(habitId, date?)`, `fetchWeeklyData()`
  - All functions handle errors and throw with meaningful messages.
- `utils.ts`: `cn()` utility (clsx + tailwind-merge), date helpers (`getWeekDays()`, `formatDate()`, `isToday()`, `isFuture()`).
- `use-habits.ts`: SWR hook wrapping `fetchHabits()` with `mutate` for optimistic updates.
- `use-weekly.ts`: SWR hook wrapping `fetchWeeklyData()` with `mutate` for revalidation after toggle.

**Done when:** Hooks compile without TypeScript errors and types match the API spec.
**Depends on:** Step 7

---

## Step 9: UI components
**Files:** `apps/web/components/habit-card.tsx`, `apps/web/components/streak-badge.tsx`, `apps/web/components/habit-grid.tsx`, `apps/web/components/weekly-heatmap.tsx`, `apps/web/components/add-habit-sheet.tsx`, `apps/web/components/edit-habit-dialog.tsx`, `apps/web/components/delete-habit-dialog.tsx`, `apps/web/components/empty-state.tsx`
**Description:**
- Build all components as specified in `ui.md` with the organic/warm design system from `vision.md`.
- `habit-card.tsx`: Card with glass border, emoji (3xl), name (DM Sans), StreakBadge, 48×48 toggle circle, dropdown menu. Optimistic toggle via SWR mutate. `fadeInUp` animation with stagger.
- `streak-badge.tsx`: "🔥 N days" with JetBrains Mono for number, amber glow when streak > 0.
- `habit-grid.tsx`: CSS Grid `auto-fill, minmax(280px, 1fr)` with `gap-5`. Renders HabitCards or EmptyState.
- `weekly-heatmap.tsx`: 7-column grid with day labels (JetBrains Mono, muted). Colored cells per habit: green (complete), surface (missed), dimmed (future).
- `add-habit-sheet.tsx`: Sheet with name + emoji inputs, warm green submit button.
- `edit-habit-dialog.tsx`: Dialog with pre-filled form, PUT on submit.
- `delete-habit-dialog.tsx`: AlertDialog with red destructive confirm.
- `empty-state.tsx`: 🌿 emoji, "No habits yet" heading, CTA button.
- All components use shadcn/ui primitives and custom design tokens.

**Done when:** All components render without errors when imported.
**Depends on:** Step 8

---

## Step 10: Dashboard page assembly
**Files:** `apps/web/app/page.tsx`
**Description:**
- Wire up the dashboard page as a client component (`'use client'`).
- Use `useHabits()` hook for habits list, `useWeekly()` for heatmap data.
- Render: Header (title "Today's Habits" in Sora 700, date in JetBrains Mono muted, "Add Habit" button) → HabitGrid → WeeklyHeatmap.
- Handle loading state (show loading.tsx skeleton), error state (message + retry), empty state (delegated to HabitGrid → EmptyState).
- Connect Add Habit sheet trigger to header button.
- Pass edit/delete callbacks from page → grid → cards, with state management for which dialog is open.
- After toggle: mutate both `useHabits` and `useWeekly` caches for instant UI update.

**Done when:** Full app works end-to-end with both services running: create habit, toggle completion, see streak update, view heatmap, edit/delete habits. Verify with `vercel dev -L` or by running backend (port 8000) and frontend (port 3000) separately.
**Depends on:** Steps 5, 9
