# UI Components — Habit Tracker

## Design System Reference
See `vision.md` for full color system, typography, and effects. See `design-system.md` for ready-to-copy CSS.

Key tokens:
- Primary: `#4ADE80` (warm green)
- Accent: `#FBBF24` (amber)
- Background: `#0C0F0A` (green-tinted near-black)
- Surface: `#1A1F16` (cards, panels)
- Text: `#F0F4E8` (warm off-white)
- Muted: `#6B7260` (secondary text)
- Fonts: Sora (display/heading), DM Sans (body), JetBrains Mono (accents)

---

## Page: Dashboard (`/`)

### Layout (`apps/web/app/layout.tsx`)
- Dark mode only: `<html className="dark">` with `bg-[#0C0F0A] text-[#F0F4E8]`
- Fonts loaded via `next/font/google`: Sora (700, 600), DM Sans (400, 500), JetBrains Mono (500)
- CSS variables set on `<body>` for font families
- Max-width container: `max-w-4xl mx-auto px-6 py-10`
- TooltipProvider wrapper at root

### Loading State (`apps/web/app/loading.tsx`)
- Skeleton cards matching habit-card dimensions
- Pulsing animation with Tailwind `animate-pulse`
- Same grid layout as habit-grid

### Dashboard Page (`apps/web/app/page.tsx`)
- Client component (`'use client'`) — needs SWR + interactivity
- Sections: Header → HabitGrid → WeeklyHeatmap
- Uses `useHabits()` and `useWeekly()` hooks
- Handles loading, error, and empty states

---

## Components

### `habit-card.tsx` (`apps/web/components/habit-card.tsx`)
- **Props**: `habit: Habit`, `onToggle: () => void`, `onEdit: () => void`, `onDelete: () => void`
- **Layout**: div with `card-surface` class (from design-system.md), padding-5
  - Left: emoji (text-3xl)
  - Center: name (DM Sans font-medium), StreakBadge below
  - Right: large 48×48 toggle circle + dropdown trigger ("..." icon)
- **Toggle circle**: Uses `toggle-circle` + `toggle-complete`/`toggle-incomplete` classes
- **Animation**: `animate-toggleBounce` class applied briefly on toggle
- **Fade-in**: `animate-fadeInUp` with staggered `animation-delay` per card index
- **Dropdown menu** (shadcn `DropdownMenu`): "Edit" and "Delete" items

### `streak-badge.tsx` (`apps/web/components/streak-badge.tsx`)
- **Props**: `streak: number`
- Uses `streak-badge` + `streak-active`/`streak-inactive` classes
- Shows "🔥 N days" (singular/plural) when streak > 0
- Shows "Start today!" in muted when streak = 0

### `habit-grid.tsx` (`apps/web/components/habit-grid.tsx`)
- **Props**: `habits: Habit[]`, event handlers passed through
- **Layout**: CSS Grid with `auto-fill, minmax(280px, 1fr)` and `gap-5`
- Maps habits → HabitCard for each
- Shows EmptyState when empty

### `weekly-heatmap.tsx` (`apps/web/components/weekly-heatmap.tsx`)
- **Props**: `weeklyData: WeeklyData | undefined`
- Section with "This Week" heading (Sora 600)
- 8-column grid: label column + 7 day columns. Header: day abbreviations (M, T, W, T, F, S, S) in mono font.
- One row per habit. First cell = emoji + truncated name (muted). Cells use `heatmap-cell` + status class.
- Today column indicated with subtle dot below day label

### `add-habit-sheet.tsx` (`apps/web/components/add-habit-sheet.tsx`)
- shadcn `Sheet` (right side)
- Form: Name `Input` (required), Emoji `Input` (optional, default ⭐)
- Buttons: "Cancel" (ghost) + "Add Habit" (primary bg)
- On submit: POST → mutate → close → reset form

### `edit-habit-dialog.tsx` (`apps/web/components/edit-habit-dialog.tsx`)
- shadcn `Dialog`, pre-filled form
- On submit: PUT → mutate → close

### `delete-habit-dialog.tsx` (`apps/web/components/delete-habit-dialog.tsx`)
- shadcn `AlertDialog`
- "Delete '{name}'? This will remove all completion history."
- On confirm: DELETE → mutate → close

### `empty-state.tsx` (`apps/web/components/empty-state.tsx`)
- Centered: 🌿 emoji, "No habits yet" (heading), description (muted body), CTA button (primary)

---

## shadcn/ui Components Needed
- Card, CardContent
- Button
- Input, Label
- Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose
- Dialog, DialogContent, DialogHeader, DialogTitle
- AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription
- DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
- Tooltip, TooltipProvider, TooltipContent, TooltipTrigger
