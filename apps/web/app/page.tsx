"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitGrid } from "@/components/habit-grid";
import { WeeklyHeatmap } from "@/components/weekly-heatmap";
import { AddHabitSheet } from "@/components/add-habit-sheet";
import { EditHabitDialog } from "@/components/edit-habit-dialog";
import { DeleteHabitDialog } from "@/components/delete-habit-dialog";
import { useHabits } from "@/hooks/use-habits";
import { useWeekly } from "@/hooks/use-weekly";
import { formatDisplayDate } from "@/lib/utils";
import type { Habit } from "@/lib/types";

export default function Page() {
  const { habits, isLoading, error, toggle, create, update, remove } = useHabits();
  const { weekly } = useWeekly();

  const [addOpen, setAddOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [deleteHabit, setDeleteHabit] = useState<Habit | null>(null);

  const completedToday = habits.filter((h) => h.completed_today).length;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className="text-heading" style={{ fontSize: "1.25rem" }}>Could not reach the API</p>
        <p className="text-body text-muted max-w-sm">
          Make sure the backend is running, or set{" "}
          <code className="text-accent" style={{ color: "var(--color-primary)" }}>
            NEXT_PUBLIC_API_URL
          </code>
          .
        </p>
        {error?.message && (
          <p className="text-accent" style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ── Header ────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-sm mb-1"
            style={{ color: "var(--color-muted)", fontFamily: "var(--font-accent)" }}
          >
            {formatDisplayDate(new Date())}
          </p>
          <h1 className="text-display">
            {habits.length > 0
              ? `${completedToday} / ${habits.length} done`
              : "Today"}
          </h1>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="shrink-0 bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)] font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add habit
        </Button>
      </header>

      {/* ── Habit grid ────────────────────────────────────────── */}
      {isLoading ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="card-surface h-[88px] animate-pulse"
              style={{ opacity: 1 - i * 0.2 }}
            />
          ))}
        </div>
      ) : (
        <HabitGrid
          habits={habits}
          onToggle={toggle}
          onEdit={setEditHabit}
          onDelete={setDeleteHabit}
          onAddHabit={() => setAddOpen(true)}
        />
      )}

      {/* ── Weekly heatmap ────────────────────────────────────── */}
      {weekly && <WeeklyHeatmap weeklyData={weekly} />}

      {/* ── Add sheet ─────────────────────────────────────────── */}
      <AddHabitSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={async (data) => {
          await create(data);
        }}
      />

      {/* ── Edit dialog ───────────────────────────────────────── */}
      <EditHabitDialog
        habit={editHabit}
        open={editHabit !== null}
        onOpenChange={(open) => {
          if (!open) setEditHabit(null);
        }}
        onSubmit={async (id, data) => {
          await update(id, data);
        }}
      />

      {/* ── Delete dialog ─────────────────────────────────────── */}
      <DeleteHabitDialog
        habit={deleteHabit}
        open={deleteHabit !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteHabit(null);
        }}
        onConfirm={async () => {
          if (deleteHabit) await remove(deleteHabit.id);
        }}
      />
    </div>
  );
}
