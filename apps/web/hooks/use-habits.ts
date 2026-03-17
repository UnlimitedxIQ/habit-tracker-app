"use client";

import useSWR, { useSWRConfig } from "swr";
import {
  fetchHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleCompletion,
} from "@/lib/api";
import type { Habit, HabitCreate, HabitUpdate } from "@/lib/types";

export const HABITS_KEY = "/habits";

// ---------------------------------------------------------------------------
// Optimistic streak estimation
// ---------------------------------------------------------------------------
// When the user taps toggle, we update the UI immediately before the server
// responds. We know the new `completed_today` value exactly, but `current_streak`
// requires knowledge of the full completion history — which only the server has.
//
// This function makes a local estimate so the badge doesn't flash stale data.
// The server's true value replaces it when revalidation completes (~200ms later).
//
// Trade-off:
//   - Increment/decrement approach: fast and right 95% of the time, but
//     occasionally shows streak=1 for a moment when the actual streak is 5.
//   - Show stale value approach: never wrong, but the badge doesn't animate
//     until the server responds — slightly less satisfying.
//
// The increment/decrement approach is used here. The server always corrects it.
function estimateStreak(habit: Habit, willBeCompleted: boolean): number {
  if (willBeCompleted) {
    // Adding today's completion — streak goes up by at least 1
    return Math.max(1, habit.current_streak + 1);
  } else {
    // Removing today's completion — streak drops
    return Math.max(0, habit.current_streak - 1);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useHabits() {
  const { data, error, isLoading, mutate } = useSWR<Habit[]>(
    HABITS_KEY,
    fetchHabits,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Global mutate lets us invalidate weekly cache from here too
  const { mutate: globalMutate } = useSWRConfig();

  // ── Toggle completion ────────────────────────────────────────────────────
  const toggle = async (habitId: number, date?: string) => {
    const current = data ?? [];
    const habit = current.find((h) => h.id === habitId);
    if (!habit) return;

    const willBeCompleted = !habit.completed_today;

    // Optimistic update: flip completed_today and estimate the new streak
    const optimistic: Habit[] = current.map((h) =>
      h.id === habitId
        ? {
            ...h,
            completed_today: willBeCompleted,
            current_streak: estimateStreak(h, willBeCompleted),
          }
        : h
    );

    await mutate(
      async () => {
        await toggleCompletion(habitId, date);
        return fetchHabits(); // refetch true values from server
      },
      {
        optimisticData: optimistic,
        rollbackOnError: true,
        revalidate: false, // the mutate fn already fetches fresh data
      }
    );

    // Also revalidate the weekly heatmap — it reflects the same completion state
    globalMutate("/completions/weekly");
  };

  // ── Create ───────────────────────────────────────────────────────────────
  const create = async (data: HabitCreate) => {
    const newHabit = await createHabit(data);
    await mutate(); // re-fetch the full list
    return newHabit;
  };

  // ── Update ───────────────────────────────────────────────────────────────
  const update = async (id: number, payload: HabitUpdate) => {
    // Optimistic: apply the change locally before the server responds
    const optimistic = (current: Habit[] | undefined) =>
      (current ?? []).map((h) =>
        h.id === id ? { ...h, ...payload } : h
      );

    await mutate(
      async (current) => {
        await updateHabit(id, payload);
        return optimistic(current);
      },
      {
        optimisticData: optimistic(data),
        rollbackOnError: true,
        revalidate: true,
      }
    );
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const remove = async (id: number) => {
    // Optimistic: remove from list immediately
    const optimistic = (current: Habit[] | undefined) =>
      (current ?? []).filter((h) => h.id !== id);

    await mutate(
      async (current) => {
        await deleteHabit(id);
        return optimistic(current);
      },
      {
        optimisticData: optimistic(data),
        rollbackOnError: true,
        revalidate: false,
      }
    );

    // Revalidate weekly view (deleted habit disappears from heatmap)
    globalMutate("/completions/weekly");
  };

  return {
    habits: data ?? [],
    isLoading,
    error,
    mutate,
    toggle,
    create,
    update,
    remove,
  };
}

