# Build Plan, Project Structure & Implementation Notes

## 17. Project Structure

```
doki/
├── frontend/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── home.tsx
│   │   │   ├── roster.tsx
│   │   │   ├── battle.tsx
│   │   │   ├── breed.tsx
│   │   │   └── lootbox.tsx
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── CatCard.tsx
│   │   ├── CatWithAccessories.tsx
│   │   ├── StatPill.tsx
│   │   ├── RarityBadge.tsx
│   │   ├── HealthBar.tsx
│   │   ├── BattleArena.tsx
│   │   ├── BreedingChamber.tsx
│   │   └── LootBoxOpener.tsx
│   ├── animations/
│   │   ├── battleAnimations.ts
│   │   ├── breedAnimations.ts
│   │   └── lootBoxAnimations.ts
│   ├── hooks/
│   │   ├── useBattle.ts
│   │   ├── useBreed.ts
│   │   └── useRoster.ts
│   ├── store/
│   │   ├── userStore.ts
│   │   ├── rosterStore.ts
│   │   └── currencyStore.ts
│   └── utils/
│       ├── battleEngine.ts
│       ├── promptBuilder.ts
│       └── hashUtils.ts
│
├── backend/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── cats.ts
│   │   ├── battles.ts
│   │   ├── breed.ts
│   │   ├── lootbox.ts
│   │   └── accessories.ts
│   ├── services/
│   │   ├── battleService.ts
│   │   ├── breedService.ts
│   │   ├── aiGenerationService.ts
│   │   ├── lootboxService.ts
│   │   └── eloService.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Cat.ts
│   │   ├── Battle.ts
│   │   ├── BreedCache.ts
│   │   ├── Accessory.ts
│   │   └── CatalogCat.ts
│   ├── prompts/
│   │   ├── stylelock.ts
│   │   ├── varietyTokens.ts
│   │   ├── rarityBlocks.ts
│   │   └── assemblePrompt.ts
│   └── jobs/
│       ├── catalogGeneration.ts
│       ├── weeklyLeaderboardReset.ts
│       └── dailyRewards.ts
│
├── database/
│   ├── migrations/
│   │   ├── 001_users.sql
│   │   ├── 002_cats.sql
│   │   ├── 003_accessories.sql
│   │   ├── 004_battles.sql
│   │   ├── 005_breed_cache.sql
│   │   ├── 006_catalog_cats.sql
│   │   └── 007_transactions.sql
│   └── seeds/
│       ├── catalog_cats.ts
│       └── accessories.ts
│
└── content-pipeline/
    ├── generateCatalogCats.ts
    ├── generateAccessories.ts
    └── validateArtStyle.ts
```

---

## 18. Build Order

Feed these phases sequentially. Each phase is a complete, independently testable unit.

**Phase 1 — Database & Auth** (Days 1–2): Set up Supabase project. Run all migrations in order. Implement `/api/auth/register` and `/api/auth/login`. Verify: create user, login, receive JWT.

**Phase 2 — Cat System** (Days 3–4): Implement Cat model with all fields. Implement `GET /api/cats/:cat_id` and `GET /api/users/:user_id/roster`. Build `CatCard.tsx` and `CatWithAccessories.tsx` with z-index layering system. Verify: fetch a cat, render it with empty accessory slots.

**Phase 3 — Loot Box** (Days 5–6): Implement `lootboxService.ts` (pull algorithm, pity counters). Seed catalog_cats with 50 placeholder cats per rarity. Implement `POST /api/lootbox/pull`. Build `LootBoxOpener.tsx` with all four rarity animations. Verify: pull a cat, see animation, cat appears in roster.

**Phase 4 — Battle System** (Days 7–9): Implement `battleService.ts` (full battle algorithm, damage formula, row-level locking). Implement `POST /api/battles/initiate` and `POST /api/battles/:battle_id/complete`. Build `BattleArena.tsx` with all animations (attack, damage float, victory, defeat). Implement cat transfer. Implement ELO update. Verify: initiate battle, watch animations, see cat transfer.

**Phase 5 — Breeding System** (Days 10–12): Implement `breedService.ts` (stat blending, rarity escalation, pair hash, breed cache). Implement `POST /api/breed/initiate`. Build `BreedingChamber.tsx` with full 4-phase animation. Wire Claude API for name generation. Wire Replicate API for image generation. Verify: breed two cats, see animation, new cat in roster.

**Phase 6 — AI Prompt System** (Days 13–14): Implement `promptBuilder.ts` with all three layers. Implement variety token vocabulary and `selectVarietyTokens()` inheritance algorithm. Test: generate 20 bred cats, verify visual variety and style consistency. Run content pipeline: generate 200 catalog cats for real.

**Phase 7 — Accessory System** (Days 15–16): Implement Accessory model and `cat_accessories` join table. Implement `PATCH /api/cats/:cat_id/accessory` (equip) and `DELETE /api/cats/:cat_id/accessory/:slot` (unequip). Seed 10 starter accessories (2 per slot). Verify: equip hat on cat, see it render in all screens.

**Phase 8 — Polish & Launch Prep** (Days 17–20): Daily login bonus system. Push notifications (Expo Notifications). Leaderboard. Weekly reset cron job. Achievements. Player progression. Full end-to-end QA. Performance audit (all animations at 60fps, battles resolve < 15 sec). Launch.

---

## 19. Critical Implementation Notes

**All animations must use React Native Reanimated 3** (`useSharedValue`, `withSpring`, `withTiming`, `withSequence`). Never the legacy `Animated` API. All animations run on the UI thread, not the JS thread. Target 60fps on iPhone 12+, 30fps minimum on older devices.

**Image loading**: Use `expo-image` for better caching. All cat images are cached locally after first load (LRU cache, 200 image limit). Placeholder renders instantly while real image loads.

**State management**: Zustand for global state (user, roster, currency). React Query for all API calls (automatic caching, background refresh). Local battle state managed in `useBattle.ts` hook — not global store. Battles are ephemeral.

**Breed pair hash is order-independent**:

```javascript
function hashBreedPair(catId1, catId2) {
  const sorted = [catId1, catId2].sort()
  return SHA256(sorted[0] + ':' + sorted[1]).toString()
  // A×B always equals B×A
}
```

**Accessory z-index rendering**:

```javascript
const SLOT_Z_INDEX = {
  back: 1, body: 2, waist: 3, paw: 4, head: 5
}
```

**All currency operations are atomic database transactions**. If cat creation fails after currency deduction, the entire transaction rolls back automatically.

**Real-money purchases verified server-side only**. Never trust client-reported purchase amounts. Only credit Pawcoin after successful server-side receipt verification (Apple/Google).

**Single most important implementation principle**: Every player action must complete in under 3 taps and under 15 seconds. If any flow requires more, redesign it. A 13-year-old waiting in line has 45 seconds of attention. Every second of friction is a lost player.

---

## 20. Launch Checklist

**Technical**:
- All database migrations run on production Supabase
- All API endpoints tested (full Postman collection)
- Battle algorithm correct for all edge cases including ties and 50-round cap
- Breeding hash is order-independent
- AI generation pipeline scoring >=7 on style validator
- Catalog pre-populated (200 Common, 150 Rare, 100 Epic, 50 Legendary)
- All loot box animations play at 60fps on iPhone 12
- All breeding animation phases play correctly
- Accessory layering renders correctly on all cat rarities
- Currency transactions atomic (no negative balance possible)
- Pity counters guarantee Epic at 50 pulls, Legendary at 100
- ELO updates correctly after each PvP battle
- Push notifications fire for all trigger events
- Daily login bonus cron job runs at midnight UTC
- Real-money purchase verification working (iOS + Android)
- App Store / Google Play submissions approved
- COPPA compliance review complete (parental consent for under 13)
- Rate limiting on all endpoints
- CDN configured for cat images (sub-200ms globally)
- Error logging configured (Sentry)
- Analytics pipeline verified (all events reaching PostHog)

**Content**:
- 500+ catalog cats generated and style-validated
- 20+ starter accessories (minimum 4 per slot)
- All achievement icons finalized
- All sound effects integrated
- All haptic patterns tuned on physical devices
- App icon finalized (1024x1024)
- App Store screenshots (6.7" and 6.1" iPhone, 12.9" iPad)
- App Store description and keywords finalized
- Privacy policy and terms of service published

**Soft Launch Targets** (Philippines + Canada, weeks 1–2):
- D1 retention >= 35%
- D7 retention >= 18%
- Average session length >= 40 seconds
- Sessions per user per day >= 3
- First purchase conversion >= 2%
- Crash-free rate >= 99%

If targets met: global launch. If D1 retention < 30%: review onboarding. If session length < 30 sec: review animation pacing. If conversion < 1.5%: review Starter Pack pricing and offer timing.

---

## 21. Post-Launch Roadmap

**Month 1 — Stability**: Fix crash bugs and edge cases from real users. Monitor economy balance. A/B test first purchase offer timing.

**Month 2 — Engagement**: Launch Season 1 (monthly leaderboard + exclusive seasonal cat reward). Add 10 new accessories. Add "Favorite" cat feature (one cat cannot be taken in battle).

**Month 3 — Monetization**: Launch Accessory Shop (50 accessories purchasable with Pawcoin). Launch Battle Pass ($4.99/month: exclusive cat + 10 accessories + 2x daily bonus). Add "Cat Showcase" profile page (shareable to social media).

**Month 4 — Social**: Friend system (add friends, view rosters). Friendly battle mode (challenge friends directly, no cat transfer). Guild system (5-player groups, weekly guild leaderboard).

**Month 6 — Expansion**: "Legendary Lineage" (trace full breeding ancestry of any cat). Limited-time event cats (Halloween, Christmas, Valentine's Day). Trading system (swap cats with friends, Pawcoin fee).

---

*End of DOKI Technical PRD v3.*
