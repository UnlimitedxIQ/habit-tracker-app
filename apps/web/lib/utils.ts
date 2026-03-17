import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ---------------------------------------------------------------------------
// Tailwind class merge helper
// ---------------------------------------------------------------------------

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Returns an array of 7 ISO date strings (YYYY-MM-DD) for Mon–Sun
 * of the week that contains the given weekStart date.
 */
export function getWeekDays(weekStart: string): string[] {
  const start = new Date(weekStart + "T00:00:00"); // force local timezone
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISODate(d);
  });
}

/** Format a date string or Date as short weekday label: "Mon", "Tue", … */
export function formatDate(dateOrStr: string | Date): string {
  const d =
    typeof dateOrStr === "string"
      ? new Date(dateOrStr + "T00:00:00")
      : dateOrStr;
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

/** Format a Date for the dashboard header: "Tuesday, March 18" */
export function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Returns today's date as an ISO date string: "YYYY-MM-DD" */
export function todayISO(): string {
  return toISODate(new Date());
}

/** True if the given ISO date string is today. */
export function isToday(dateStr: string): boolean {
  return dateStr === todayISO();
}

/** True if the given ISO date string is strictly in the future. */
export function isFuture(dateStr: string): boolean {
  return dateStr > todayISO();
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
