# bloom. 🌸

A minimal habit tracker that helps you build and stick to daily routines.

**Live demo:** [https://trackyourday-v1.netlify.app/](https://trackyourday-v1.netlify.app/)

## Overview

Bloom is a fully client-side habit tracker. There's no backend and no account system — every habit you create and every day you check off is saved directly in your browser's `localStorage`. The interface leans into a soft, glassmorphic, peach-and-cream design system built on modern CSS (OKLCH colors), paired with the Outfit and Quicksand Google Fonts.

On first visit, the app seeds itself with four demo habits and 30 days of realistic-looking history so the dashboard isn't empty — you can immediately see how streaks, heatmaps, and category breakdowns look before adding your own habits.

## Features

- **Habit creation & editing** — name, category (Mind / Body / Growth / Soul), frequency (daily, weekdays only, weekends only), a color theme, and an emoji icon
- **One-tap daily completion** with a gentle synthesized chime (Web Audio API) on check-off
- **Streak tracking** — per-habit current streak plus a global current/best streak across all habits
- **7-day history dots** on every habit card
- **30-day consistency heatmap** showing how many habits were completed on each day
- **Focus area breakdown** — 14-day completion rate per category, shown as percentage bars
- **Category filtering** (All / Mind / Body / Growth / Soul)
- **Light/dark theme toggle**, persisted independently of habit data
- **Empty state** with a call-to-action when no habits exist (or match the current filter)
- **Fully responsive**, glassmorphic UI with ambient background glow effects


No npm install, no bundler, no build step. Open `index.html` in a browser (or serve the folder statically) and it runs.

## Project Structure

```
.
├── index.html      # Markup, layout, and the add/edit habit dialog
├── styles.css       # Design system: colors, glassmorphism, layout, responsive rules
└── app.js          # All application logic: state, rendering, streaks, heatmap, theme toggle
```

## Running Locally

Since there's no build step, any static file server works:

```bash
# Option 1: just open it
open index.html

# Option 2: serve it (recommended, avoids module/CORS quirks)
npx serve .
# or
python3 -m http.server 8000
```

## Data Model

Each habit is stored as an object like:

```json
{
  "id": "habit-1718000000000",
  "name": "Morning Meditation",
  "category": "mind",
  "frequency": "daily",
  "color": "rose",
  "emoji": "🧘",
  "createdAt": "2026-06-01",
  "history": ["2026-06-01", "2026-06-02", "..."]
}
```

All habits are saved as a single JSON array under the `bloom_habits` key in `localStorage`; the active theme is saved separately under `bloom_theme`.

## Future Scope

- **Cloud sync / accounts** — optional sign-in (e.g. Supabase/Firebase) so habits persist across devices instead of being tied to one browser
- **Data export/import** — JSON or CSV backup and restore, so clearing browser storage doesn't wipe progress
- **Reminders/notifications** — browser push notifications or scheduled reminders for habits not yet completed
- **PWA support** — installable, offline-capable app via a service worker
- **Extended history view** — a full calendar/month view beyond the current 30-day heatmap window
- **Habit notes/journaling** — optional short note attached to each day's completion
- **Richer analytics** — weekly/monthly trend charts, longest-streak history, completion-rate trends over time


