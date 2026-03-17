"use client";

import { useState } from "react";
import { MoreHorizontal, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StreakBadge } from "@/components/streak-badge";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  index?: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitCard({
  habit,
  index = 0,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [bouncing, setBouncing] = useState(false);

  const handleToggle = () => {
    setBouncing(true);
    onToggle();
    setTimeout(() => setBouncing(false), 150);
  };

  return (
    <div
      className="card-surface p-5 flex items-center gap-4 animate-fadeInUp"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Emoji */}
      <span className="text-3xl shrink-0 select-none">{habit.emoji}</span>

      {/* Name + streak */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--color-text)] truncate">
          {habit.name}
        </p>
        <StreakBadge streak={habit.current_streak} />
      </div>

      {/* Toggle + menu */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggle}
          aria-label={habit.completed_today ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "toggle-circle",
            bouncing && "animate-toggleBounce",
            habit.completed_today ? "toggle-complete" : "toggle-incomplete"
          )}
        >
          {habit.completed_today && (
            <Check className="w-5 h-5 text-[var(--color-bg)]" strokeWidth={3} />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="More options"
              className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
