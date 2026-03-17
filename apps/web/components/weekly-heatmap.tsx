"use client";

import React from "react";
import { getWeekDays, formatDate, isToday, isFuture } from "@/lib/utils";
import type { WeeklyData } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WeeklyHeatmapProps {
  weeklyData: WeeklyData | null;
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyHeatmap({ weeklyData }: WeeklyHeatmapProps) {
  if (!weeklyData || weeklyData.habits.length === 0) return null;

  const days = getWeekDays(weeklyData.week_start);

  return (
    <section className="mt-10">
      <h2 className="text-heading mb-5">This Week</h2>

      {/* 8-column grid: label | Mon | Tue | Wed | Thu | Fri | Sat | Sun */}
      <div
        className="grid items-center gap-3"
        style={{ gridTemplateColumns: "minmax(100px, 1fr) repeat(7, 40px)" }}
      >
        {/* Header row — empty label cell + day abbreviations */}
        <div />
        {days.map((dateStr, i) => (
          <div key={dateStr} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "text-accent text-center",
                isToday(dateStr)
                  ? "text-[var(--color-primary)]"
                  : "text-muted"
              )}
            >
              {DAY_LABELS[i]}
            </span>
            {/* Dot under today's column */}
            {isToday(dateStr) && (
              <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] mx-auto" />
            )}
          </div>
        ))}

        {/* One row per habit */}
        {weeklyData.habits.map((habitData) => (
          <React.Fragment key={habitData.habit_id}>
            {/* Label cell */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg shrink-0">{habitData.emoji}</span>
              <span className="text-body text-muted truncate text-sm">
                {habitData.name}
              </span>
            </div>

            {/* 7 day cells */}
            {days.map((dateStr) => {
              const completed = habitData.completions[dateStr] === true;
              const future = isFuture(dateStr);

              return (
                <div
                  key={`${habitData.habit_id}-${dateStr}`}
                  title={`${formatDate(dateStr)}${completed ? " ✓" : ""}`}
                  className={cn(
                    "heatmap-cell",
                    future
                      ? "heatmap-future"
                      : completed
                      ? "heatmap-completed"
                      : "heatmap-missed"
                  )}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
