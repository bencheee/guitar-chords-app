# Guitar Chords App — CLAUDE.md

This file provides context for AI-assisted development. Keep it updated as the project evolves.

---

## Project Overview

A full-stack web app for storing and displaying guitar chord sheets. Designed primarily for use on a **65" Samsung Smart TV** (remote control navigation), with secondary support for mobile. No authentication required.

---

## Tech Stack

| Layer      | Choice                        |
|------------|-------------------------------|
| Framework  | Next.js 16 (App Router)       |
| Database   | Supabase (PostgreSQL)         |
| Styling    | Tailwind CSS                  |
| Deployment | Vercel                        |

---

## Key Design Decisions

- **Chord format:** ChordPro inline — e.g. `[Am]word [G]word`. Parsed and rendered with chords above lyrics.
- **Transpose:** All chords can be shifted ±12 semitones client-side. Original key stored in DB.
- **TV navigation:** Full keyboard/D-pad support. Arrow keys move focus, Enter confirms. No hover-only interactions. Large, high-contrast focus indicators.
- **Auto-scroll:** `requestAnimationFrame`-based smooth scroll. Configurable speed. Pause/resume with OK/Enter.
- **Wake lock:** Wake Lock API with silent video fallback to prevent Samsung TV screensaver.
- **No authentication:** Admin section is unprotected — single user only.
- **No PWA/offline:** Not required.
- **Design:** Dark theme, 3-color palette, monospace font for chord sections, clean sans-serif for UI.

---

## Data Model

```
Song {
  id          uuid (PK, default gen_random_uuid())
  title       string
  artist      string
  album       string
  year        integer
  capo        integer (0–9)
  key         string  (original key, e.g. "Am")
  content     text    (ChordPro format)
  created_at  timestamp (default now())
  updated_at  timestamp (default now())
}
```

---

## Folder Structure

```
/app
  /admin              → song management (list, add, edit, delete)
  /songs              → public library (browse, search, sort)
  /songs/[id]         → individual song page
/app/api
  /songs              → CRUD API routes
/components
  /chord-renderer     → ChordPro parser + renderer
  /transpose          → chord transposition engine
  /autoscroll         → scroll controller
  /tv-nav             → keyboard/remote navigation utilities
/lib
  /supabase.ts        → Supabase client
  /types.ts           → shared TypeScript types
```

---

## Features

### Admin
- [ ] Song list with edit/delete
- [ ] Add/Edit form (title, artist, album, year, capo 0–9, key, content)
- [ ] Monospace textarea with live preview

### Frontend — Library
- [ ] Song grid/list
- [ ] Sort by artist A–Z, title A–Z, year
- [ ] Real-time search (title + artist)
- [ ] Full remote/keyboard navigation

### Frontend — Song Page
- [ ] ChordPro renderer (chords above lyrics)
- [ ] Transpose control (–/+)
- [ ] Font size control (S / M / L / XL)
- [ ] CAPO badge
- [ ] Auto-scroll with speed slider
- [ ] Scroll pause/resume (OK/Enter key)
- [ ] Wake lock (API + video fallback)

---

## Development Phases

| Phase | Description                        | Status      |
|-------|------------------------------------|-------------|
| 1     | Project setup, Supabase, Vercel    | Complete ✓  |
| 2     | API layer (CRUD routes)            | Complete ✓  |
| 3     | Admin UI                           | Complete ✓  |
| 4     | ChordPro engine + transpose        | Complete ✓  |
| 5     | Frontend library page              | Not started |
| 6     | Song page (scroll, wake lock, etc) | Not started |
| 7     | Design & responsiveness            | Not started |
| 8     | Deployment & TV testing            | Not started |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Set in `.env.local` locally and in Vercel dashboard for production.

---

## Deployment

- **Platform:** Vercel
- **Repo:** https://github.com/bencheee/guitar-chords-app
- **Branch strategy:** `main` = production. Feature work on `dev` or feature branches.
- Push to `main` triggers automatic Vercel deploy.

---

## Notes & Reminders

- Samsung TV browser is Tizen/Chromium — test Wake Lock API early, have silent video fallback ready.
- Chord rendering must use a monospace font — chord horizontal position maps directly to character position.
- Font size control is important: TV viewing distance (~3m) means defaults may need to be larger than typical web sizes.
- Transpose shifts all `[Chord]` tokens in the content string — do not mutate DB, do it client-side.
- Next.js version is 16.2.6 — read node_modules/next/dist/docs/ if APIs behave unexpectedly.
