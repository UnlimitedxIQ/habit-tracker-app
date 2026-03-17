// TypeScript interfaces matching the FastAPI Pydantic response models exactly.
// Field names must stay in sync with backend/models.py.

export interface Habit {
  id: number;
  name: string;
  emoji: string;
  created_at: string; // ISO datetime string — "2025-01-01T00:00:00"
  current_streak: number; // consecutive days ending today or yesterday
  completed_today: boolean;
}

export interface HabitCreate {
  name: string;
  emoji?: string; // defaults to "⭐" on the backend
}

export interface HabitUpdate {
  name?: string;
  emoji?: string;
}

export interface ToggleResponse {
  habit_id: number;
  date: string; // ISO date string — "2025-01-15"
  completed: boolean; // new state after the toggle
  current_streak: number; // server-computed streak after the toggle
}

export interface WeeklyHabitData {
  habit_id: number;
  name: string;
  emoji: string;
  completions: Record<string, boolean>; // "YYYY-MM-DD" → true/false, 7 keys
}

export interface WeeklyData {
  week_start: string; // ISO date of Monday
  week_end: string; // ISO date of Sunday
  habits: WeeklyHabitData[];
}
