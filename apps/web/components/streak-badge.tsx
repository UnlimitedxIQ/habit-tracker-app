"use client";

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak > 0) {
    return (
      <span className="streak-badge streak-active">
        🔥 {streak} {streak === 1 ? "day" : "days"}
      </span>
    );
  }
  return <span className="streak-badge streak-inactive">Start today!</span>;
}
