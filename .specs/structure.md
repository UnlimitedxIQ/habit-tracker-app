# Project Structure — Habit Tracker

```
habit-tracker-app/
├── vercel.json                              # Vercel Services config
├── .gitignore                               # Python + Node ignores
│
├── backend/                                 # FastAPI service (routePrefix: /server)
│   ├── main.py                              # App entry: FastAPI, CORS, lifespan, router mounts
│   ├── requirements.txt                     # Python deps: fastapi, uvicorn, aiosqlite, pydantic
│   ├── pyproject.toml                       # Python project metadata
│   ├── database.py                          # SQLite connection, init_db(), get_db() dependency
│   ├── models.py                            # Pydantic v2 request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── habits.py                        # CRUD: GET/POST/PUT/DELETE /habits
│   │   └── completions.py                   # Toggle + weekly: /habits/{id}/toggle, /completions/weekly
│   ├── services/
│   │   ├── __init__.py
│   │   ├── habit_service.py                 # Habit CRUD business logic
│   │   └── streak_service.py                # Streak calc, toggle, weekly completions
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py                      # Shared fixtures: test DB, async client
│       ├── test_habits.py                   # Habit CRUD tests
│       ├── test_completions.py              # Toggle + weekly tests
│       └── test_streaks.py                  # Streak calculation tests
│
├── apps/
│   └── web/                                 # Next.js 16 frontend (routePrefix: /)
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── postcss.config.mjs
│       ├── components.json                  # shadcn/ui config
│       ├── app/
│       │   ├── layout.tsx                   # Root layout: fonts, dark mode, providers
│       │   ├── page.tsx                     # Dashboard: habit grid + heatmap
│       │   ├── globals.css                  # Design system CSS (from design-system.md)
│       │   └── loading.tsx                  # Skeleton loading state
│       ├── components/
│       │   ├── ui/                          # shadcn/ui primitives (auto-generated)
│       │   ├── habit-card.tsx               # Toggleable habit card
│       │   ├── habit-grid.tsx               # Responsive grid of cards
│       │   ├── add-habit-sheet.tsx           # Sheet form for new habit
│       │   ├── edit-habit-dialog.tsx         # Dialog for editing habit
│       │   ├── delete-habit-dialog.tsx       # AlertDialog for deletion
│       │   ├── weekly-heatmap.tsx            # 7-day streak heatmap
│       │   ├── streak-badge.tsx             # Fire emoji + streak count
│       │   └── empty-state.tsx              # No habits yet CTA
│       ├── lib/
│       │   ├── api.ts                       # Fetch wrapper for all API calls
│       │   ├── types.ts                     # TS types mirroring Pydantic models
│       │   └── utils.ts                     # cn(), date helpers
│       ├── hooks/
│       │   ├── use-habits.ts                # SWR hook for habits list
│       │   └── use-weekly.ts                # SWR hook for weekly heatmap data
│       └── public/
│           └── favicon.ico
│
└── .specs/                                  # Spec files (this directory)
    ├── prd.md
    ├── architecture.md
    ├── structure.md
    ├── instructions.md
    ├── schema.md
    ├── api.md
    ├── ui.md
    ├── vision.md
    └── design-system.md
```
