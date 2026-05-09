# Guitar Chords App

A full-stack web app for storing and displaying guitar chord sheets. Built for a **65" Samsung Smart TV** with remote control navigation, and also mobile-friendly.

---

## Features

- **Admin panel** — add, edit and delete songs (no login required)
- **ChordPro format** — chords displayed above the correct syllable
- **Transpose** — shift all chords up or down on the fly
- **CAPO indicator** — shown clearly on every song page
- **Auto-scroll** — smooth, configurable-speed scrolling so you can play hands-free
- **Font size control** — S / M / L / XL for comfortable TV reading
- **Search & sort** — find songs by title or artist, sort alphabetically
- **TV remote navigation** — full D-pad support (arrow keys + Enter)
- **Wake lock** — keeps the screen on during a playing session

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Framework  | Next.js 14 (App Router) |
| Database   | Supabase (PostgreSQL)   |
| Styling    | Tailwind CSS            |
| Deployment | Vercel                  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Vercel](https://vercel.com) account (for deployment)

### Local Setup

```bash
git clone https://github.com/bencheee/guitar-chords-app.git
cd guitar-chords-app
npm install
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## Chord Format

Songs use inline ChordPro format. Chords are placed in square brackets directly before the syllable they belong to:

```
[Am]Here comes the [G]sun, [C]duh duh duh
[Am]Here comes the [G]sun, and I [F]say it's all [C]right
```

The app renders these with chords positioned above the correct word.

---

## Deployment

Push to `main` → Vercel auto-deploys.

Set the environment variables in the Vercel dashboard under **Project Settings → Environment Variables**.

---

## Development Progress

See [CLAUDE.md](./CLAUDE.md) for the full development plan and phase tracking.

| Phase | Description                        | Status     |
|-------|------------------------------------|------------|
| 1     | Project setup, Supabase, Vercel    | Complete ✓  |
| 2     | API layer (CRUD routes)            | Complete ✓  |
| 3     | Admin UI                           | Complete ✓  |
| 4     | ChordPro engine + transpose        | Complete ✓  |
| 5     | Frontend library page              | Complete ✓  |
| 6     | Song page (scroll, wake lock, etc) | Complete ✓  |
| 7     | Design & responsiveness            | Not started |
| 8     | Deployment & TV testing            | Not started |
