"use client";

import { HabitCard } from "@/components/habit-card";
import { EmptyState } from "@/components/empty-state";
import type { Habit } from "@/lib/types";

interface HabitGridProps {
  habits: Habit[];
  onToggle: (id: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onAddHabit: () => void;
}

export function HabitGrid({
  habits,
  onToggle,
  onEdit,
  onDelete,
  onAddHabit,
}: HabitGridProps) {
  if (habits.length === 0) {
    return <EmptyState onAddHabit={onAddHabit} />;
  }

  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
    >
      {habits.map((habit, index) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          index={index}
          onToggle={() => onToggle(habit.id)}
          onEdit={() => onEdit(habit)}
          onDelete={() => onDelete(habit)}
        />
      ))}
    </div>
  );
}
