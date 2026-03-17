"use client";

import useSWR from "swr";
import { fetchWeeklyData } from "@/lib/api";
import type { WeeklyData } from "@/lib/types";

export const WEEKLY_KEY = "/completions/weekly";

export function useWeekly() {
  const { data, error, isLoading } = useSWR<WeeklyData>(
    WEEKLY_KEY,
    fetchWeeklyData,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    weekly: data ?? null,
    isLoading,
    error,
  };
}
