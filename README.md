# Neogammon — Elite Backgammon Platform

> Competitive online backgammon (Нарды) with real-time matchmaking, AI opponent, analytics, and a leaderboard system focused on Kazakhstan.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)
![Zustand](https://img.shields.io/badge/Zustand-State-orange)

---

## Overview

Neogammon is a full-stack cyber-sport backgammon platform built with a Chess.com-style ergonomic UI and an electric blue neon aesthetic. Players can compete in ranked matches (Bullet, Blitz, Rapid), play against a local AI opponent, track their performance analytics, and climb regional leaderboards across Kazakhstan.

---

## Features

### Gameplay
- **SVG Board Canvas** — fully interactive 24-point backgammon board rendered in SVG with layered rendering (triangles → labels → target dots → checkers)
- **AI Opponent (Neural AI)** — instant local game against a greedy AI that rolls dice, prioritizes hits and prime-building, and moves automatically with animated delays
- **Roll Dice mechanic** — click `ROLL DICE` button on your turn; doubles give 4 moves
- **Hit & Bar logic** — blot hits send opponent checkers to bar; bar checkers must re-enter before other moves
- **Valid move highlighting** — blue dot indicators on legal destination points
- **Optimistic UI** — local board state updates instantly before server confirmation

### Game Modes
| Mode | Time Control | Description |
|---|---|---|
| Bullet | 1 min | Ultra-fast ranked |
| Blitz | 5 min | Standard ranked |
| Rapid | 10 min | Casual ranked |
| Neural AI | Unlimited | Practice vs bot |
| Play Friend | Custom | Private lobby |
| Trainer | Unlimited | AI coach analysis |

### Authentication
- Register with username + email + password
- Automatic `profiles` table creation on sign-up (1000 ELO, Bronze tier)
- Sign in / Sign out from the sidebar
- Supabase Auth with Row Level Security

### Analytics & Leaderboard
- `/track` — Win rate, ELO by mode, pip count, blot safety coefficient
- `/rank` — Global and regional leaderboards (Global / Kazakhstan / Almaty / Astana)
- `/learn` — Structured lesson roadmap (Beginner → Intermediate → Master)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 with custom design tokens |
| State | Zustand (boardStore, gameStore, lobbyStore) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (`signInWithPassword`, `signUp`) |
| Real-time | Supabase Realtime (multiplayer board sync) |
| Deployment | Vercel |

---

## Project Structure

```
neogammon/
├── app/
│   ├── layout.tsx                  # Root layout with LeftSidebar
│   ├── page.tsx                    # Redirects to /play
│   ├── auth/
│   │   ├── signin/page.tsx         # Sign-in form
│   │   └── register/page.tsx       # Registration form
│   ├── play/
│   │   ├── page.tsx                # Main play page (board + controller)
│   │   └── match/[id]/page.tsx     # Live match viewport
│   ├── rank/page.tsx               # Leaderboard
│   ├── track/page.tsx              # Analytics dashboard
│   └── learn/
│       ├── page.tsx                # Lesson roadmap
│       └── lesson/[id]/page.tsx    # Puzzle sandbox
├── components/
│   ├── shared/
│   │   └── LeftSidebar.tsx         # Navigation + auth state
│   ├── game/
│   │   ├── BoardCanvas.tsx         # SVG board (7-layer rendering)
│   │   ├── GameControllerPanel.tsx # Mode selection + game controls
│   │   └── PlayerHUD.tsx           # Avatar, ELO, timer display
│   └── dashboard/
│       ├── LeaderboardTable.tsx
│       └── StatsGrid.tsx
├── stores/
│   ├── boardStore.ts               # Board state, AI moves, Supabase sync
│   ├── gameStore.ts                # Queue FSM, match state
│   └── lobbyStore.ts               # Party lobby state
├── lib/
│   ├── supabase.ts                 # Singleton Supabase client
│   └── websocket/events.ts         # WebSocket event type definitions
└── supabase/
    └── schema.sql                  # Full PostgreSQL DDL
```

---

## Database Schema

9 tables with full RLS policies and triggers:

| Table | Description |
|---|---|
| `profiles` | User stats, ELO ratings (blitz/bullet/rapid/puzzles), skill tier |
| `matches` | Match records with board state JSON, dice, results |
| `match_moves` | Move-by-move log with AI evaluation scores |
| `puzzles` | Training puzzles with correct move answers |
| `user_lesson_progress` | Per-user lesson completion tracking |
| `leaderboards` | Seasonal regional rankings |
| `notifications` | Friend requests, invites, system alerts |
| `friendships` | Social graph (pending / accepted / blocked) |
| `lobby_rooms` + `lobby_members` | Multiplayer party system |

Automatic trigger `trg_update_match_stats` updates `profiles.total_matches`, `total_wins`, and `elo_rating` when a match completes.

---

## Design System

**Color Palette:**

| Token | Hex | Usage |
|---|---|---|
| Background | `#0B0E14` | Canvas, page background |
| Secondary | `#151A23` | Sidebar, panels |
| Tertiary | `#1E2532` | Cards, rows |
| Primary (Electric Blue) | `#1A56FF` | Accent, active states, neon glow |
| Success | `#16A34A` | CTA buttons, win indicators |
| Crimson | `#DC2626` | Hits, errors, alerts |

**Skill Tiers:** Bronze → Silver → Gold → Platinum → Diamond → Master

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/bekarrys/neogammon.git
cd neogammon
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Initialize the database

In your Supabase dashboard → **SQL Editor**, paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Vercel)

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import from GitHub
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

---

## Board Rendering Architecture

The SVG board uses a strict 7-layer rendering pipeline to eliminate z-order artifacts:

```
Layer 0  Board surfaces (background rects)
Layer 1  All 24 triangles (one pass — no checkers mixed in)
Layer 2  Point number labels
Layer 3  Valid-move target dots
Layer 4  All checker stacks (one pass — always on top of triangles)
Layer 5  Bar checkers
Layer 6  Dice display
Layer 7  Roll / AI-wait / turn indicator
```

Checker stacking formula:
- **Lower half** (points 13–24): stack grows **upward** from bottom edge
- **Upper half** (points 1–12): stack grows **downward** from top edge

---

## Roadmap

- [ ] Real-time multiplayer via Supabase Realtime channels
- [ ] Live countdown timer per player (Bullet/Blitz/Rapid)
- [ ] ELO calculation and leaderboard updates after each ranked match
- [ ] Puzzle system with server-stored board states
- [ ] Friends list and private lobby invitations
- [ ] Match replay engine from `match_moves` log
- [ ] Mobile-responsive layout

---

## Author

**Bekarrys** — [github.com/bekarrys](https://github.com/bekarrys)

---

## License

MIT
