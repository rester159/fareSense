# Project Spec — DOKI: Kawaii Cat Battle & Breeding Game

This folder is the **authoritative product and technical spec** for the project. Agents should read it for requirements and update it as the project evolves.

## Index

| # | File | Spec Sections | What's in it |
|---|------|---------------|--------------|
| 01 | `01-overview.md` | 1–2 | Vision, tech stack, design philosophy, core rationale |
| 02 | `02-core-mechanics.md` | 3 | Three attributes, battle algorithm, damage formula, breeding system |
| 03 | `03-visual-art.md` | 4 | Art style bible, stat/rarity visual mapping, AI prompt system, style validator |
| 04 | `04-ui-screens.md` | 5–8 | Battle, Breeding, Home, Loot Box screen layouts and animations |
| 05 | `05-accessories.md` | 9 | Accessory slots, rendering architecture, z-index layering |
| 06 | `06-database.md` | 10 | Full PostgreSQL/Supabase schema (all tables, indexes) |
| 07 | `07-api.md` | 11 | All API endpoints, rate limits, currency atomicity |
| 08 | `08-progression-pvp.md` | 12–13 | Cat XP, player levels, daily login, achievements, matchmaking, ELO |
| 09 | `09-monetization-analytics.md` | 14–15 | Pawcoin economy, IAP tiers, PostHog events, key metrics |
| 10 | `10-edge-cases.md` | 16 | Battle/breeding edge cases, network/offline handling |
| 11 | `11-build-plan.md` | 17–21 | Project structure, build phases, implementation notes, launch checklist, roadmap |

## Which files to read by role

- **Everyone**: `01-overview.md` (vision + tech stack)
- **Backend / API**: `02-core-mechanics.md`, `06-database.md`, `07-api.md`, `10-edge-cases.md`
- **Frontend / UI**: `04-ui-screens.md`, `05-accessories.md`
- **Animation / UX**: `04-ui-screens.md` (animation sequences)
- **AI / Content Pipeline**: `03-visual-art.md`
- **Game Balance / Economy**: `02-core-mechanics.md`, `08-progression-pvp.md`, `09-monetization-analytics.md`
- **Project Planning**: `11-build-plan.md`

## Conventions

- One file per major area. Prefer updating existing files over creating one-off notes.
- When adding a new spec file, add it to the Index above.
- The original monolithic spec is preserved as `spec.md` for reference.
