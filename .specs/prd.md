# Product Requirements Document — Habit Tracker

## Overview
A personal habit tracker MVP. Users create habits, mark daily completions, and track streaks via a visual dashboard with a warm, organic aesthetic. No auth — single-user, zero-friction.

## Target User
An individual who wants a simple, fast, visually satisfying way to track daily habits and see streaks at a glance.

## Core Features

### F1: Habit Management
- Create a habit with name (required) and emoji (optional, default "circle")
- Edit habit name and emoji
- Delete habit with confirmation (hard delete with CASCADE)
- List all active habits sorted by creation date

### F2: Daily Completion Toggle
- Toggle a habit as complete/incomplete for a specific date (defaults to today)
- Completion state persists in SQLite
- Visual feedback on toggle (scale animation + color shift)
- Optimistic UI update via SWR mutation

### F3: Streak Statistics
- Current streak: consecutive days completed ending today (or yesterday if today not yet completed)
- Streak count displayed on each habit card with a fire emoji
- Calculated server-side for accuracy

### F4: Weekly Heatmap
- 7-column grid (Mon–Sun of current week)
- One row per habit
- Cell color intensity: completed (warm green), missed (muted surface), future (dimmed)

### F5: Single-Page Dashboard
- All interactions on one page (sheets/dialogs for add/edit/delete)
- Responsive grid of habit cards (1 col mobile, 2 col sm, 3 col md)
- Empty state with CTA when no habits exist
- Loading skeletons during data fetch

## Non-Goals (MVP)
- No authentication / multi-user
- No habit categories or tags
- No notifications or reminders
- No historical analytics beyond current week
- No data export

## Technical Constraints
- Backend: FastAPI + SQLite via `aiosqlite` (zero config, single file)
- Frontend: Next.js 16 (App Router) + shadcn/ui + Tailwind CSS
- Deployment: Vercel Services (FastAPI at `/server`, Next.js at `/`)
- Communication: REST API (JSON) via auto-provisioned `NEXT_PUBLIC_API_URL`
