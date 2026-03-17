"use client";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddHabit: () => void;
}

export function EmptyState({ onAddHabit }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-6xl mb-6 animate-scaleIn">🌿</div>
      <h2 className="text-heading mb-3">No habits yet</h2>
      <p className="text-body text-muted mb-8 max-w-xs">
        Build a streak, one day at a time. Add your first habit to get started.
      </p>
      <Button
        onClick={onAddHabit}
        className="bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)] font-medium px-6 h-11"
      >
        Add your first habit
      </Button>
    </div>
  );
}
