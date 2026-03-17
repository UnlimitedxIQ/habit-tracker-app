# Design System — Ready-to-Copy CSS

Copy this into `apps/web/app/globals.css` as the first action when building the frontend.

```css
/* === Font Imports === */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* === Tailwind === */
@import "tailwindcss";

/* === Custom Properties === */
:root {
  /* Colors — Organic/Warm Dark */
  --color-primary: #4ADE80;
  --color-secondary: #22C55E;
  --color-accent: #FBBF24;
  --color-bg: #0C0F0A;
  --color-surface: #1A1F16;
  --color-text: #F0F4E8;
  --color-muted: #6B7260;

  /* Borders */
  --color-border: rgba(74, 222, 128, 0.08);
  --color-border-hover: rgba(74, 222, 128, 0.15);

  /* Typography */
  --font-display: 'Sora', sans-serif;
  --font-heading: 'Sora', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-accent: 'JetBrains Mono', monospace;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* Shadows — layered for depth on dark */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadow-elevated: 0 2px 8px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3);

  /* Transitions */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 400ms;
}

/* === Base Styles === */
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}

/* === Glass & Depth Utilities === */
.card-surface {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: border-color var(--duration-normal) var(--ease-smooth),
              box-shadow var(--duration-normal) var(--ease-smooth);
}

.card-surface:hover {
  border-color: var(--color-border-hover);
}

/* === Animation Keyframes === */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes toggleBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* === Animation Utilities === */
.animate-fadeInUp {
  animation: fadeInUp var(--duration-slow) var(--ease-smooth) both;
}

.animate-fadeIn {
  animation: fadeIn var(--duration-normal) var(--ease-smooth) both;
}

.animate-scaleIn {
  animation: scaleIn var(--duration-slow) var(--ease-bounce) both;
}

.animate-toggleBounce {
  animation: toggleBounce var(--duration-fast) var(--ease-bounce);
}

/* === Typography Scale === */
.text-display {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--color-text);
}

.text-heading {
  font-family: var(--font-heading);
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--color-text);
}

.text-body {
  font-family: var(--font-body);
  font-size: clamp(0.875rem, 1.2vw, 1rem);
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.6;
}

.text-accent {
  font-family: var(--font-accent);
  font-size: clamp(0.8rem, 1vw, 0.9rem);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.text-muted {
  color: var(--color-muted);
}

/* === Toggle Button === */
.toggle-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-smooth),
              border-color var(--duration-normal) var(--ease-smooth),
              transform var(--duration-fast) var(--ease-bounce);
}

.toggle-circle:active {
  transform: scale(0.95);
}

.toggle-incomplete {
  background-color: transparent;
  border: 2px solid var(--color-muted);
}

.toggle-complete {
  background-color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

/* === Heatmap Cell === */
.heatmap-cell {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  transition: background-color var(--duration-normal) var(--ease-smooth);
}

.heatmap-completed {
  background-color: var(--color-primary);
}

.heatmap-missed {
  background-color: var(--color-surface);
}

.heatmap-future {
  background-color: var(--color-surface);
  opacity: 0.3;
}

/* === Streak Badge === */
.streak-badge {
  font-family: var(--font-accent);
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.streak-active {
  color: var(--color-accent);
}

.streak-inactive {
  color: var(--color-muted);
}
```

## Usage Notes

- Copy this entire block into `apps/web/app/globals.css`
- The CSS custom properties are used throughout all components
- shadcn/ui components should be styled to use these variables where possible
- The `card-surface` class replaces the default shadcn Card styling for habit cards
- Toggle, heatmap, and streak classes are used directly on the respective components
- Font imports are via Google Fonts CDN — alternatively use `next/font/google` in layout.tsx for better performance (preferred)
- If using `next/font/google`, remove the `@import url(...)` line and set font variables via className on `<body>`
