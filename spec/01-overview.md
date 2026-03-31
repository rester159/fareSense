# 1. Executive Summary & Vision

**DOKI** is a mobile-first React Native game targeting Gen Z (ages 12–20). The core loop is: **Collect → Battle → Breed → Collect**. Sessions last under 60 seconds. Players spend virtual currency on loot boxes for random cats, battle other players' cats to win them, breed pairs into AI-generated new cats, and repeat.

**Display constraints (non-negotiable)**:
- **Portrait-locked.** The app runs exclusively in portrait orientation. No landscape mode, no rotation handling.
- **No scrolling.** Every screen fits entirely within a single viewport. No ScrollView, no FlatList for core screens. Content is designed to fit the visible area. The only exception is the Roster screen, which may use a paginated grid (swipe between pages, not scroll).
- **No pinch-to-zoom.** All content is fixed-scale. Cat images, buttons, and text are sized for the viewport and do not support zoom gestures.
- **Full-screen, edge-to-edge.** No browser chrome, no system UI overlap. Use SafeAreaView for notch/dynamic island avoidance but fill the rest.
- **Target viewport:** iPhone SE (375×667pt) as the minimum. All layouts must look correct on SE through iPhone 15 Pro Max (430×932pt). Scale elements proportionally — never use fixed pixel positions that break on smaller screens.

**Unique Value Propositions**:

The player-driven economy means losing a battle costs you your cat. Winning expands your roster. Stakes are real. Breeding serves as a discovery mechanic disguised as progression — unique pair combinations generate novel AI cats with unique art and names. The accessory layer allows cosmetic items (hats, shirts, waist items, back pieces, paw items) to render on top of base cat art, with the full database and rendering architecture built to support future accessory monetization from day one. The kawaii-locked aesthetic — Hello Kitty–inspired, pastel, chibi, hand-drawn — is enforced via constrained AI prompts and a style consistency validator. Sessions are sub-60 seconds, habit-forming, and friction-free.

**Monetization**: Virtual currency ("Pawcoin") via loot boxes. Future monetization: accessory shop, battle pass, seasonal events.

**Tech Stack**:

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React Native (Expo) | Cross-platform iOS/Android, Reanimated 3 for animations, Haptics API |
| Backend | Node.js + Express | Fast, JSON-native, clean async/await for AI calls |
| Database | PostgreSQL (Supabase) | Relational integrity, UUID support, JSONB for battle logs, row-level locking |
| Auth | Supabase Auth | Built-in JWT, social login |
| Image Storage | Cloudflare R2 | Cheap, fast global CDN for cat images |
| AI Image Gen | Replicate (FLUX or SDXL) | API-based, no infra, fast turnaround |
| AI Name Gen | Claude API (claude-sonnet-4-6) | Reliable creative output, fast, cheap per token |
| Real-time PvP | Supabase Realtime | WebSocket-based, integrates with existing DB |
| Animations | React Native Reanimated 3 | Hardware-accelerated UI thread animations, spring physics |
| Haptics | Expo Haptics | Simple API, consistent iOS/Android |
| Analytics | PostHog | Open source, event tracking, funnel analysis |
| Push Notifications | Expo Notifications | Cross-platform, local + remote |

---

# 2. Design Philosophy & Core Rationale

## 2.1 Why Three Attributes

Three stats are the game design sweet spot. Fewer than three collapses battles into linear dominance — a two-attribute system (Attack/Defense) has no emergent strategy. Exactly three (Power/Toughness/Speed) creates a genuine triangle of viable archetypes: glass cannons (high Power + high Speed + low Toughness) win fast and die fast; tanks (high Toughness + low Power + low Speed) win via attrition; balanced cats are matchup-dependent. More than three stats dilutes the impact of each one and requires players to optimize pairwise interactions they will never memorize. Three stats ensure every stat matters in every battle.

## 2.2 Why Breeding Matters

Breeding is not pay-to-win. It is a discovery mechanic disguised as progression. The first breeding of a unique pair generates a new AI cat — art, name, and stats all novel. This mirrors Pokémon breeding excitement: you are discovering a new species. Repeated breeding of the same pair yields the same cat. Rarity escalation (two Rares have a 40% chance to produce an Epic) creates a rarity ladder players breed toward. Stat blending logic (offspring stats average parent stats ± random offset) is intuitive. The one-hour cooldown prevents spam and forces roster management. The result is a breeding system that feels rewarding, not exploitative.

## 2.3 Why PvP Battles With Cat Transfer

PvE loops (beat NPC → get gold → level up) are infinite, static, and low-stakes. PvP with cat transfer creates a player-driven economy with genuine stakes. Losing has a cost. Strong players accumulate cats. Weaker players breed upward. Knowing someone might claim your Level 5 veteran cat makes every battle count psychologically in a way no loot box reward can match.

## 2.4 Why Gacha (Loot Boxes)

Loot boxes are the speed-of-monetization mechanism. Strict pity mechanics (guaranteed Epic after 50 pulls, Legendary after 100) make this more consumer-friendly than most gacha games. Players feel fairness. The viral loop — 13-year-old gets a Legendary, shows friends, friends download the app — is standard for collectible games and highly effective for this demographic.
