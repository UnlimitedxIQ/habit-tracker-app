# Product Vision

## What this is
A minimal habit tracker web app with a FastAPI + SQLite backend and a Next.js frontend, deployed as a single Vercel Services project. Users can create habits, toggle daily completions, and view streak stats via a weekly heatmap. No authentication — single-user MVP designed for personal use. The UI has an organic warmth: dark backgrounds with forest greens and amber accents that make completing a habit feel rewarding.

## User experience walkthrough
1. User opens the app and lands on the **Dashboard** — a dark, warm page with a large "Today's Habits" heading and the current date.
2. If no habits exist, they see a friendly empty state: a large leaf emoji, "No habits yet", and a warm green "Add your first habit" button.
3. They click the button — a **sheet** slides in from the right with a name field and optional emoji input. They type "Meditate" and pick "🧘". Submit.
4. The habit appears as a **card** in the grid: rounded-2xl with a soft glass border, the emoji large on the left, name in the center, and a large circular toggle on the right.
5. They tap the toggle — it fills with a warm green (#4ADE80) and a subtle scale bounce. The streak badge updates to "🔥 1 day". The toggle is satisfying and instant (optimistic).
6. Below the cards, a **Weekly Heatmap** shows Mon–Sun columns. Today's cell for "Meditate" is now green. Past days are muted. Future days are dimmed.
7. They add more habits. The grid grows responsively: 1 column on phone, 2 on tablet, 3 on desktop.
8. Clicking "..." on a card reveals Edit and Delete options in a dropdown.

## Pages / Screens

### Dashboard (route: `/`)
- **Header**: "Today's Habits" (display font, left-aligned), current date formatted as "Monday, January 15" (muted text, right). "Add Habit" button (warm green, right).
- **Habit cards grid**: Responsive grid. Each card: glass-border surface, emoji (text-3xl), name (heading font), streak badge ("🔥 N days"), large 48×48 toggle circle.
- **Weekly Heatmap section**: Heading "This Week" (heading font). 7-column labeled grid. Row per habit with emoji + truncated name. Cells are 40×40 rounded-lg squares colored by status.
- **Empty state**: Centered, large emoji, heading, description, CTA button.
- **Sheets/Dialogs**: Add habit (Sheet), Edit habit (Dialog), Delete habit (AlertDialog).

No other pages — everything is on the dashboard.

## Visual identity

### Aesthetic direction
**Organic/warm on dark.** The UI feels like a cozy productivity space — deep charcoal backgrounds with forest green accents and amber highlights. Rounded shapes everywhere (radius-2xl on cards). The dark base creates focus; the warm greens reward completion. This isn't a cold dashboard — it's a personal ritual space. Think: a greenhouse at night, lit warmly.

### Color system
| Role | Value | Usage |
|------|-------|-------|
| Primary | #4ADE80 | Toggle fills, CTAs, completed heatmap cells |
| Secondary | #22C55E | Hover states, active elements, streak highlights |
| Accent | #FBBF24 | Fire emoji glow, streak badges, notifications |
| Background | #0C0F0A | Page background — near-black with a green undertone |
| Surface | #1A1F16 | Cards, panels, sheet overlays |
| Text | #F0F4E8 | Primary text — warm off-white |
| Muted | #6B7260 | Secondary text, labels, placeholders, day labels |

### Typography
- Display: **Sora** (700) — hero headline "Today's Habits", large emphasis text
- Heading: **Sora** (600) — h2-h4 section headers like "This Week"
- Body: **DM Sans** (400) — paragraphs, habit names, form labels, UI text
- Accent: **JetBrains Mono** (500) — streak numbers, dates, stats
- Fluid sizing: `clamp(2.5rem, 5vw, 3.5rem)` display, `clamp(1.25rem, 2.5vw, 1.75rem)` heading, `clamp(0.9rem, 1.2vw, 1rem)` body

### CSS Custom Properties
```css
:root {
  --color-primary: #4ADE80;
  --color-secondary: #22C55E;
  --color-accent: #FBBF24;
  --color-bg: #0C0F0A;
  --color-surface: #1A1F16;
  --color-text: #F0F4E8;
  --color-muted: #6B7260;
  --font-display: 'Sora', sans-serif;
  --font-heading: 'Sora', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-accent: 'JetBrains Mono', monospace;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}
```

### Layout approach
- Max-width container: `max-w-4xl mx-auto`, generous padding (`px-6 py-10`)
- Cards grid: CSS Grid with `auto-fill, minmax(280px, 1fr)` for natural responsive flow
- Generous card padding (p-5) with clear hierarchy: emoji → name → streak → toggle
- Heatmap uses fixed 7-column grid with consistent cell sizes
- Spacing philosophy: breathable — `gap-5` between cards, `gap-3` between heatmap cells

### Depth & effects
- **Glass borders**: Cards have `border: 1px solid rgba(74, 222, 128, 0.08)` — a barely-visible green tint that ties to the primary color
- **Layered shadows**: Cards use `box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)` for subtle depth on dark
- **Toggle animation**: `transform: scale(1.08)` for 150ms on press, spring-back easing `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Fade-in**: Cards enter with `fadeInUp` animation (opacity 0→1, translateY 12px→0, 400ms staggered by 50ms per card)

### Reference sites
- **habitify.me** — Notice the card-based layout, satisfying toggle interaction, and streak visualization
- **everyday.app** — Notice the heatmap design, warm color palette on dark, and clean single-page feel
- **ui.shadcn.com/examples/dashboard** — Notice the card composition patterns, dark mode treatment, and component spacing

## Success criteria
- [ ] Can create a new habit with name and emoji
- [ ] Can toggle today's completion for any habit (persists to DB)
- [ ] Can see current streak count on each habit card
- [ ] Weekly heatmap shows 7 days of completion data per habit
- [ ] Can edit a habit's name/emoji
- [ ] Can delete a habit (with confirmation dialog)
- [ ] API responds correctly for all CRUD + completion + weekly endpoints
- [ ] Frontend loads and renders without errors
- [ ] Empty state renders when no habits exist
- [ ] Mobile responsive (1 column on small screens)
- [ ] Toggle animation feels satisfying (scale bounce)
- [ ] `vercel dev -L` runs both services together

## Deploy target
- Platform: Vercel Services (single project, multi-service)
- URL pattern: habit-tracker-app.vercel.app
- Framework preset: Services (must be set in Vercel dashboard)
- Environment variables:
  - `NEXT_PUBLIC_API_URL` (auto-generated by Vercel Services as `/server`)
  - For local dev without Vercel CLI: set manually to `http://localhost:8000`
- Health check: GET /server/health (backend), GET / (frontend)
