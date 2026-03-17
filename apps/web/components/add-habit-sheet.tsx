"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HabitCreate } from "@/lib/types";

interface AddHabitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: HabitCreate) => Promise<void>;
}

export function AddHabitSheet({
  open,
  onOpenChange,
  onSubmit,
}: AddHabitSheetProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setEmoji("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), emoji: emoji.trim() || undefined });
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <SheetContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
        <SheetHeader>
          <SheetTitle className="text-[var(--color-text)]">New Habit</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="habit-name" className="text-[var(--color-text)]">
              Name <span className="text-[var(--color-accent)]">*</span>
            </Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meditate, Read, Exercise…"
              required
              maxLength={100}
              className="bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus-visible:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="habit-emoji" className="text-[var(--color-text)]">
              Emoji{" "}
              <span className="text-[var(--color-muted)] font-normal">
                (optional)
              </span>
            </Label>
            <Input
              id="habit-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="⭐"
              maxLength={8}
              className="bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus-visible:ring-[var(--color-primary)] w-24"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { onOpenChange(false); reset(); }}
              className="flex-1 text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)] disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add Habit"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
