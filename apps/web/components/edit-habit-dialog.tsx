"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Habit, HabitUpdate } from "@/lib/types";

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: HabitUpdate) => Promise<void>;
}

export function EditHabitDialog({
  habit,
  open,
  onOpenChange,
  onSubmit,
}: EditHabitDialogProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync form when the target habit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setEmoji(habit.emoji);
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(habit.id, {
        name: name.trim(),
        emoji: emoji.trim() || habit.emoji,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--color-surface)] border-[var(--color-border)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[var(--color-text)]">
            Edit Habit
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name" className="text-[var(--color-text)]">
              Name
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus-visible:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-emoji" className="text-[var(--color-text)]">
              Emoji
            </Label>
            <Input
              id="edit-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={8}
              className="bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text)] focus-visible:ring-[var(--color-primary)] w-24"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-secondary)] disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
