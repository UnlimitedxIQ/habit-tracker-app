import type {
  Habit,
  HabitCreate,
  HabitUpdate,
  ToggleResponse,
  WeeklyData,
} from "@/lib/types";

// In production Vercel Services sets this to "/server" (relative, same-origin).
// Locally it falls back to the uvicorn dev server.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });

  if (!res.ok) {
    // FastAPI error bodies: { "detail": "..." } or { "detail": [...] }
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        message = body.detail.map((d: { msg: string }) => d.msg).join(", ");
      }
    } catch {
      // ignore parse failure — use the status-based message above
    }
    throw new Error(message);
  }

  // 204 No Content → return undefined cast to T
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

/** SWR fetcher — key "/habits" maps here */
export async function fetchHabits(): Promise<Habit[]> {
  return request<Habit[]>("/habits/");
}

export async function createHabit(data: HabitCreate): Promise<Habit> {
  return request<Habit>("/habits/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateHabit(
  id: number,
  data: HabitUpdate
): Promise<Habit> {
  return request<Habit>(`/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteHabit(id: number): Promise<void> {
  return request<void>(`/habits/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Completions
// ---------------------------------------------------------------------------

export async function toggleCompletion(
  habitId: number,
  date?: string
): Promise<ToggleResponse> {
  return request<ToggleResponse>(`/habits/${habitId}/toggle`, {
    method: "POST",
    body: JSON.stringify(date ? { date } : {}),
  });
}

/** SWR fetcher — key "/completions/weekly" maps here */
export async function fetchWeeklyData(): Promise<WeeklyData> {
  return request<WeeklyData>("/completions/weekly");
}
