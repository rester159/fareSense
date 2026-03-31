# DOKI — Kawaii Cat Battle & Breeding Game

Mobile-first (portrait-only, no scroll) game: **Collect → Battle → Breed → Collect**. See `spec/` for the full PRD.

## Phases implemented

- **Phase 1** — Database & Auth (migrations, register/login/refresh, portrait-locked Expo app)
- **Phase 2** — Cat system (GET cat/roster, CatCard, CatWithAccessories, Roster screen, dev give-cat)
- **Phase 3** — Loot box (lootboxService, pity, POST /api/lootbox/pull, LootBoxOpener, lootbox screen)
- **Phase 4** — Battle (battleService, initiate/complete, cat transfer, ELO, battle screen)
- **Phase 5** — Breeding (breedService, cache, POST /api/breed/initiate, breed screen)
- **Phase 6** — AI prompt system (prompts/stylelock, varietyTokens, assemblePrompt)
- **Phase 7** — Accessories (PATCH/DELETE cat accessory, GET /api/accessories, seed)
- **Phase 8** — Polish (POST /api/currency/daily-bonus, GET leaderboard/global|weekly, GET users/:id/achievements)

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) account (free tier works)

### 1. Clone and install

```bash
cd dokidoki
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. One-command setup

```bash
npm run setup
```

This will:
1. Ask for your **Neon connection string** (get it from [console.neon.tech](https://console.neon.tech) → your project → Connection Details)
2. Generate a secure `JWT_SECRET` (or let you provide one)
3. Create `.env` at the repo root
4. Run all database migrations
5. Seed the catalog (so "Get a cat" works)

**Non-interactive:** Set env vars first, then run:
```bash
set DATABASE_URL=postgresql://...  # your Neon URI
npm run setup
```

### 3. Alternative: manual env setup

If you prefer to set `.env` yourself:

- Copy `.env.example` to `.env`
- Set `DATABASE_URL` — Neon connection string (from neon.tech → Connection string)
- Set `JWT_SECRET` — at least 32 random characters
- Run `npm run db:migrate` then `npm run db:seed`

### 4. Frontend (optional for web)

For **web** at `http://localhost:3001`, no extra config — the backend serves the app.  
For **Expo mobile**, copy `frontend/.env.example` to `frontend/.env` and set `EXPO_PUBLIC_API_URL` to your machine IP (e.g. `http://192.168.1.5:3001`) so the phone can reach the API.

### 5. Run backend

```bash
npm run backend
# or: npm run backend:dev  (with --watch)
```

### 6. Run frontend

```bash
npm run frontend
```

Then open in Expo Go on your phone or simulator. **Portrait lock** and **auth (register / login)** are implemented.

### Path to the experience (web)

To open the game in a browser on the same machine as the backend:

1. Build the web app: `npm run build:web` (or `cd frontend && npm run build:web`).
2. Start the backend: `npm run backend`.
3. Open **http://localhost:3001/** (or **http://\<server-IP\>:3001/** e.g. `http://10.0.5.202:3001/`).

The backend serves the web app at `/` and the API at `/api`. No `EXPO_PUBLIC_API_URL` is needed for this setup — the web build uses the same origin for API calls.

*Seed is included in `npm run setup`. To re-seed manually: `npm run db:seed`*

### Verify Phase 1

1. Open app → Sign up (email, password, username) → you should land on Home.
2. Log out → Log in with same credentials → Home again.
3. Backend `GET /health` returns `{ "ok": true }`.

### Verify Phase 2 (Cat system)

1. From Home tap **ROSTER** → Roster screen.
2. Tap **Get a cat (dev)** → one cat appears (from catalog seed).
3. Swipe horizontally to see more pages when you have 7+ cats.

### Verify other phases

- **Loot box:** Home → LOOT BOX → OPEN BOX (100 🐾). Get a cat; currency deducts.
- **Battle:** Home → BATTLE → pick a cat → Fight. Result (win/loss) and cat transfer for PvP.
- **Breed:** Home → BREED → select two cats → BREED ✨ (50 🐾). New cat from cache or catalog.
- **Daily bonus:** `POST /api/currency/daily-bonus` with auth (e.g. from app or Postman).
- **Leaderboard:** `GET /api/leaderboard/global` or `/api/leaderboard/weekly`.

---

## Project layout

- `spec/` — Product & technical spec (split by domain)
- `AGENTS.md` — Agent definitions
- `backend/` — Node + Express + Neon Postgres (JWT auth)
- `frontend/` — Expo (React Native), portrait-only, single-viewport
- `database/migrations/` — SQL migrations for Neon Postgres

Build order: see `spec/11-build-plan.md`.
