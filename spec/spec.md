# DOKI: Kawaii Cat Battle & Breeding Game
## Ultra-Detailed Technical Product Requirements Document (v3 — Full Consolidated)

---

## 1. Executive Summary & Vision

**DOKI** is a mobile-first React Native game targeting Gen Z (ages 12–20). The core loop is: **Collect → Battle → Breed → Collect**. Sessions last under 60 seconds. Players spend virtual currency on loot boxes for random cats, battle other players' cats to win them, breed pairs into AI-generated new cats, and repeat.

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

## 2. Design Philosophy & Core Rationale

### 2.1 Why Three Attributes

Three stats are the game design sweet spot. Fewer than three collapses battles into linear dominance — a two-attribute system (Attack/Defense) has no emergent strategy. Exactly three (Power/Toughness/Speed) creates a genuine triangle of viable archetypes: glass cannons (high Power + high Speed + low Toughness) win fast and die fast; tanks (high Toughness + low Power + low Speed) win via attrition; balanced cats are matchup-dependent. More than three stats dilutes the impact of each one and requires players to optimize pairwise interactions they will never memorize. Three stats ensure every stat matters in every battle.

### 2.2 Why Breeding Matters

Breeding is not pay-to-win. It is a discovery mechanic disguised as progression. The first breeding of a unique pair generates a new AI cat — art, name, and stats all novel. This mirrors Pokémon breeding excitement: you are discovering a new species. Repeated breeding of the same pair yields the same cat. Rarity escalation (two Rares have a 40% chance to produce an Epic) creates a rarity ladder players breed toward. Stat blending logic (offspring stats average parent stats ± random offset) is intuitive. The one-hour cooldown prevents spam and forces roster management. The result is a breeding system that feels rewarding, not exploitative.

### 2.3 Why PvP Battles With Cat Transfer

PvE loops (beat NPC → get gold → level up) are infinite, static, and low-stakes. PvP with cat transfer creates a player-driven economy with genuine stakes. Losing has a cost. Strong players accumulate cats. Weaker players breed upward. Knowing someone might claim your Level 5 veteran cat makes every battle count psychologically in a way no loot box reward can match.

### 2.4 Why Gacha (Loot Boxes)

Loot boxes are the speed-of-monetization mechanism. Strict pity mechanics (guaranteed Epic after 50 pulls, Legendary after 100) make this more consumer-friendly than most gacha games. Players feel fairness. The viral loop — 13-year-old gets a Legendary, shows friends, friends download the app — is standard for collectible games and highly effective for this demographic.

---

## 3. Core Mechanics

### 3.1 The Three Attributes

**Power** (Range: 1–10, integer): Raw damage output. Combat formula contribution: `(attacker.power / 2.0) + d4`. Flavor: "Attacking prowess." High-Power cats are Mighty, Fierce, Aggressive.

**Toughness** (Range: 1–10, integer): Health pool and damage mitigation. HP at battle start = `toughness × 3`. Defense contribution: `(defender.toughness / 4.0) + d2`. Flavor: "Defense and resilience." High-Toughness cats are Sturdy, Stalwart, Guardian.

**Speed** (Range: 1–10, integer): Turn order and evasion. Initiative roll: `speed + d6`. Evasion chance: `(speed / 20) × 100%` (Speed 10 = 50% evasion). Flavor: "Agility and reflexes." High-Speed cats are Nimble, Dash, Zephyr.

**Stat Ranges by Rarity**:

| Rarity | Power | Toughness | Speed | Total Avg |
|--------|-------|-----------|-------|-----------|
| Common | 1–3 | 1–3 | 1–3 | ~4.5 |
| Rare | 3–6 | 3–6 | 3–6 | ~9 |
| Epic | 5–8 | 5–8 | 5–8 | ~13.5 |
| Legendary | 7–10 | 7–10 | 7–10 | ~18 |

**Stat Generation at Pull**:

```javascript
function generateStatsForRarity(rarity) {
  const ranges = {
    common: [1, 3], rare: [3, 6], epic: [5, 8], legendary: [7, 10]
  }
  const [min, max] = ranges[rarity]
  return {
    power:     CLAMP(randomInt(min, max) + randomInt(-1, 1), min, max),
    toughness: CLAMP(randomInt(min, max) + randomInt(-1, 1), min, max),
    speed:     CLAMP(randomInt(min, max) + randomInt(-1, 1), min, max)
  }
}
```

Within a rarity tier, stats have ±1 variance. No crossover between tiers.

### 3.2 Battle System

#### Battle Flow Algorithm

```javascript
async function fullBattle(playerCat, opponentCat) {
  playerCat.current_hp = playerCat.toughness * 3
  opponentCat.current_hp = opponentCat.toughness * 3

  const playerInit  = playerCat.speed  + randomInt(1, 6)
  const opponentInit = opponentCat.speed + randomInt(1, 6)
  const [first, second] = playerInit >= opponentInit
    ? [playerCat, opponentCat]
    : [opponentCat, playerCat]

  let round = 0
  while (playerCat.current_hp > 0 && opponentCat.current_hp > 0) {
    round++
    const attacker = round % 2 === 1 ? first : second
    const defender = attacker === playerCat ? opponentCat : playerCat
    await battleRound(attacker, defender, round)
    if (round > 50) break  // Infinite battle prevention
  }

  // Determine winner
  if (round > 50) {
    const playerPct   = playerCat.current_hp  / (playerCat.toughness  * 3)
    const opponentPct = opponentCat.current_hp / (opponentCat.toughness * 3)
    return playerPct >= opponentPct ? playerCat : opponentCat
  }
  return playerCat.current_hp > 0 ? playerCat : opponentCat
}
```

#### Damage Formula

```javascript
function calculateDamage(attacker, defender) {
  const evasionRoll = randomInt(0, 100)
  if (evasionRoll < (defender.speed * 5)) {
    return { damage: 0, evaded: true }
  }
  const baseDamage     = (attacker.power / 2.0) + randomInt(1, 4)
  const defenseReduce  = (defender.toughness / 4.0) + randomInt(0, 2)
  const damage = Math.max(1, Math.floor(baseDamage - defenseReduce))
  return { damage, evaded: false }
}
```

**Damage formula rationale**: Power/2 ensures Power-10 deals ~5 base damage and Power-1 deals ~0.5. The d4 randomness range (±1–4) prevents deterministic outcomes without overwhelming stat differences. Toughness/4 means maximum defense (~2.5 damage blocked) doesn't nullify attacks. Min 1 damage guarantees battles always terminate. Speed's 50% maximum evasion chance at Speed-10 creates genuine counterplay without being overpowered.

**Example matchups**:

| Attacker | Defender | Avg Damage | Notes |
|----------|----------|-----------|-------|
| Power 10, Speed 10 | Toughness 1, Speed 1 | ~5–7 | One or two shots |
| Power 1, Speed 1 | Toughness 10, Speed 10 | ~0–1 | Very slow win |
| Power 5, Speed 5 | Toughness 5, Speed 5 | ~2–3 | Balanced, ~5–6 rounds |

#### Battle Resolution

```javascript
async function battleEnd(winnerCat, loserCat) {
  // Winner rewards
  ANIMATE_VICTORY(winnerCat)
  HAPTIC_BURST(intensity: 0.9, duration: 200)
  PLAY_SOUND('sfx_victory_fanfare')
  PARTICLE_EFFECT('confetti', duration: 1000)
  winnerCat.xp += 10
  winnerCat.owner.currency += 5

  // Cat transfer (atomic database transaction)
  await db.transaction(async trx => {
    loserCat.owner_id = winnerCat.owner_id
    loserCat.times_transferred += 1
    await loserCat.save(trx)
    await logBattle(winnerCat, loserCat, trx)
  })

  ANIMATE_DEFEAT(loserCat)
  HAPTIC_PULSE(intensity: 0.4, duration: 100)
  PLAY_SOUND('sfx_defeat_tone')
  SHOW_RESULT_SCREEN(winnerCat, loserCat)
}
```

#### Tie Resolution

```javascript
if (playerCat.current_hp <= 0 && opponentCat.current_hp <= 0) {
  if (playerCat.speed > opponentCat.speed) winner = playerCat
  else if (opponentCat.speed > playerCat.speed) winner = opponentCat
  else winner = Math.random() < 0.5 ? playerCat : opponentCat
  // Display: "CLOSE CALL!" banner
}
```

### 3.3 Breeding System

#### Prerequisites

Player must own both cats. Both cats must not be in cooldown (one breed per cat per 60 minutes). Player must have ≥ 50 Pawcoin.

#### Stat Inheritance

```javascript
function breedStats(parent1, parent2) {
  return {
    power:     CLAMP(Math.floor((parent1.power     + parent2.power)     / 2) + randomInt(-2, 2), 1, 10),
    toughness: CLAMP(Math.floor((parent1.toughness + parent2.toughness) / 2) + randomInt(-2, 2), 1, 10),
    speed:     CLAMP(Math.floor((parent1.speed     + parent2.speed)     / 2) + randomInt(-2, 2), 1, 10)
  }
}
```

#### Rarity Escalation

```javascript
function breedRarity(rarity1, rarity2) {
  const tiers = ['common', 'rare', 'epic', 'legendary']
  const maxTier = Math.max(tiers.indexOf(rarity1), tiers.indexOf(rarity2))
  const roll = Math.random()

  const escalationTable = {
    0: roll < 0.30 ? 1 : 0,   // Two commons: 30% chance Rare
    1: roll < 0.40 ? 2 : 1,   // Two rares: 40% chance Epic
    2: roll < 0.40 ? 3 : 2,   // Two epics: 40% chance Legendary
    3: 3                        // Two legendaries: always Legendary
  }
  return tiers[escalationTable[maxTier]]
}
```

#### Breed Pair Hash (Order-Independent)

```javascript
function hashBreedPair(catId1, catId2) {
  const sorted = [catId1, catId2].sort()
  return SHA256(sorted[0] + ':' + sorted[1]).toString()
  // Breeding A×B always equals B×A
}
```

#### Full Breed Flow

```javascript
async function initiateBreed(userId, parent1Id, parent2Id) {
  return await db.transaction(async trx => {
    const [p1, p2] = await validateBreedPrereqs(userId, parent1Id, parent2Id, trx)

    await deductCurrency(userId, 50, trx)
    await setCooldowns(parent1Id, parent2Id, trx)

    const offspringStats  = breedStats(p1, p2)
    const offspringRarity = breedRarity(p1.rarity, p2.rarity)
    const pairHash        = hashBreedPair(parent1Id, parent2Id)
    const cached          = await BreedCache.findByHash(pairHash, trx)

    let imageUrl, name, isNew = false

    if (cached) {
      imageUrl = cached.image_url
      name     = cached.name
    } else {
      isNew = true
      const varietyTokens = selectVarietyTokens(p1.variety_tokens, p2.variety_tokens)
      const prompt        = assemblePrompt(varietyTokens, offspringStats, offspringRarity)
      imageUrl = await generateWithTimeout(prompt, 10000)
      name     = await generateName(offspringRarity, offspringStats, varietyTokens)
      await BreedCache.create({ pairHash, imageUrl, name, ...offspringStats, prompt }, trx)
    }

    const newCat = await Cat.create({
      owner_id: userId, name, base_image_url: imageUrl,
      rarity: offspringRarity, ...offspringStats,
      parent1_id: parent1Id, parent2_id: parent2Id,
      generation: Math.max(p1.generation, p2.generation) + 1,
      breed_pair_hash: pairHash, acquired_via: 'breeding'
    }, trx)

    return { cat: newCat, isNew }
  })
}
```

#### AI Generation Timeout Handling

```javascript
async function generateWithTimeout(prompt, timeoutMs = 10000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('GENERATION_TIMEOUT')), timeoutMs)
  )
  try {
    return await Promise.race([generateImage(prompt), timeout])
  } catch (err) {
    if (err.message === 'GENERATION_TIMEOUT') {
      await FailedGenerations.create({ prompt, error: err.message })
      const fallback = await CatalogCat.findClosest({ rarity, variety })
      return fallback.image_url
    }
    throw err
  }
}
```

---

## 4. Visual System & Art Direction

### 4.1 Art Style Bible (Non-Negotiable)

**Inspiration**: Hello Kitty (Sanrio), Tamagotchi, Pusheen, Gudetama, Studio Ghibli (Totoro-level simplicity).

**Medium**: Digital illustration, hand-drawn aesthetic. NOT photorealistic, NOT 3D render, NOT anime-detailed.

**Proportions**: Chibi — head = 50% of body height, tiny limbs, oversized eyes.

**Eyes (Critical)**: Oval-shaped, 30–40% of face width. Black iris, white circular highlight dot at top-right of each iris. Eyelashes optional, preferred on Rare+. Never realistic pupils.

**Face**: Minimal features. Small dot nose, simple curved smile or neutral line. No complex expressions.

**Color Palette (Pastel Only)**:
- Pinks: #FFB6D9 → #FF69B4 (baby pink to hot pink)
- Blues: #ADD8E6 → #87CEEB (light blue to sky blue)
- Yellows: #FFFFE0 → #FFD700 (light yellow to gold)
- Greens: #BDFCC9 → #98FF98 (mint to light green)
- Purples: #E6D7FF → #DA70D6 (lavender to orchid)
- Grays: #F0F0F0 → #D3D3D3 (off-white to light gray)
- NO pure black (#000000), NO dark navy, NO neon saturation

**Linework**: Thin, consistent 1–2px strokes. No thick outlines. No sketchy texture.

**Body Shape**: Rounded, soft. No sharp angles. All curves are gentle arcs.

**Tail**: Present on every cat. Curved and fluffy or sleek. No spiky tails.

**Background**: Always transparent (PNG alpha channel).

**Canvas**: 256×256px base export, scalable via CSS.

### 4.2 Stat-to-Visual Mapping

Every cat's silhouette should communicate its stat profile at a glance.

**Power** drives body build: Power 1–3 = small, delicate, wispy with thin limbs and pale pastels; Power 4–6 = medium proportional, neutral saturation; Power 7–10 = robust, wider shoulders, richer pastel saturation.

**Toughness** drives body shape: Toughness 1–3 = very round and soft, larger ears, bigger eyes, emphasizes vulnerability and cuddliness; Toughness 4–6 = normally proportioned; Toughness 7–10 = wider and rounder body, slightly smaller head-to-body ratio, suggests durability.

**Speed** drives pose: Speed 1–3 = relaxed sitting or reclining, tail curled, half-closed sleepy eyes; Speed 4–6 = upright neutral stance, alert eyes; Speed 7–10 = dynamic forward lean, one paw raised, tail in motion, wide alert eyes.

**Example Archetypes**:

Glass Cannon (Power 9, Toughness 2, Speed 9): Tall, thin, pale pink cat with a forward-leaning dynamic pose, huge wide eyes, small dainty paws. Suggests speed and fragility simultaneously.

Tank (Power 2, Toughness 10, Speed 1): Round, wide, peachy-colored cat in a sitting posture with a calm expression and larger body volume. Suggests immovability.

Balanced (Power 5, Toughness 5, Speed 5): Medium build, neutral pastel colors, neutral upright stance. Visually middle-ground.

### 4.3 Rarity-to-Visual Mapping

**Common**: Simple design. 1–2 colors (base + accent). Single ear style, single tail style. No patterns. Standard black iris with white highlight. No sparkles, no gradients, no glow. Example: Simple pink cat with white belly, basic round eyes, no marks.

**Rare**: More complex. 2–3 colors. Subtle symmetrical patterns allowed (spots, stripes, patches). Ears may have a distinctive shape (floppy, pointed elf ears). Optional heterochromia (one blue eye, one pink). Optional small sparkle on the eye highlight. Example: Gradient pastel blue-to-pink cat with white spots, slightly bigger ears, one eye sparkle.

**Epic**: Complex, distinctive. 3–4 coordinated colors (complementary scheme). Unique ear/tail combo (curly tail + pointed ears, feathered ears + extra fluffy tail). Ombre effects or symmetrical pattern motifs allowed. Eyes with longer lashes, secondary iris color, prominent highlight. Optional very subtle outer glow (soft 1px drop shadow in matching pastel). Example: Three-color lavender/pink/white cat with elf ears, curly tail, gradient eye, and a barely perceptible outer glow.

**Legendary**: Striking, memorable. 4–5 carefully coordinated colors. Complex symmetrical patterns (mandala-like, gradient blends). Unique silhouette (very large ears, extra fluffy, unusually shaped body). Eyes are distinctive — multiple iris colors or asymmetric detail. Subtle aura (soft radial gradient, 3px, matching color scheme). Tail uniquely colored or patterned (two-tone, feathered, striped). Example: Five-color mythical cat (pale pink body, lavender ears, gold accents, white belly, soft blue spine stripe) with asymmetrical eyes, feathered tail, and soft aura glow.

### 4.4 AI Prompt Engineering System

#### The Three-Layer Architecture

Style consistency is enforced via a layered, constrained prompt system. Layer 1 anchors every generation to the same style. Layer 2 provides a controlled combinatorial vocabulary for variety. Layer 3 derives semantic modifiers from the cat's actual stats.

**Layer 1 — Style Lock (Immutable, Prepended to Every Generation)**:

```
"Chibi kawaii cat illustration. Style: Hello Kitty by Sanrio, 
Tamagotchi, Pusheen. Medium: flat 2D digital art, hand-drawn 
aesthetic. NOT photorealistic, NOT 3D render, NOT anime-detailed. 
Proportions: oversized round head (50% of body height), tiny limbs, 
large oval eyes (35% of face width). Eyes: solid black iris, 
single white circular highlight dot at top-right of each iris. 
Face: minimal features, small dot nose, simple curved smile or 
neutral expression. Linework: thin consistent lines (1-2px), 
no thick outlines, no sketchy texture. Color philosophy: 
pastel only, soft saturation, NO pure black (#000000), 
NO neon, NO dark navy. Background: fully transparent. 
Canvas: 256x256px, cat centered, full body visible, 
no cropping. Single cat only, isolated, no background elements."
```

This text never changes. Every generation begins with this exact block.

**Layer 2 — Variety Token Vocabulary**:

Each cat's prompt includes one token from each category, selected via the variety inheritance algorithm:

Fur Base Color (12 options): `"cotton candy pink" | "sky blue" | "lemon yellow" | "mint cream" | "soft lavender" | "peach cream" | "cloud white" | "warm beige" | "pale lilac" | "soft coral" | "powder blue" | "champagne"`

Fur Accent Color (10 options, must differ from base): `"white patches" | "cream belly" | "pink inner ears" | "gold tips" | "blue stripes" | "lavender spots" | "mint gradient" | "silver shimmer" | "rose cheeks" | "lilac tail tip"`

Ear Style (6 options): `"rounded cat ears" | "pointed elf ears" | "large floppy ears" | "small neat ears" | "wide spread ears" | "folded ears"`

Tail Style (6 options): `"long curled tail" | "short fluffy tail" | "ringed striped tail" | "poofy round tail" | "thin elegant tail" | "double-tip tail"`

Eye Color (8 options): `"deep blue eyes" | "warm amber eyes" | "forest green eyes" | "soft violet eyes" | "heterochromia: one blue one pink" | "rose pink eyes" | "gold eyes" | "teal eyes"`

Special Mark (8 options, rarity-gated): `"no special marks" (Common only) | "small star birthmark on cheek" | "crescent moon marking on forehead" | "tiny heart on paw" | "diamond pattern on chest" | "swirl marking on tail" | "dot constellation pattern on back" (Epic+) | "faint galaxy shimmer on fur" (Legendary only)`

**Variety Math**: 12 × 10 × 6 × 6 × 8 × 8 = 276,480 unique visual token combinations. Approximately 276,000 visually distinct cats before any repetition — far exceeding any realistic breeding volume.

**Layer 3 — Stat-Semantic Modifiers**:

```javascript
function getStatModifiers(power, toughness, speed) {
  const mods = []

  if (power <= 3)      mods.push("delicate small-framed build")
  else if (power <= 6) mods.push("medium proportional build")
  else                 mods.push("sturdy strong-shouldered build")

  if (toughness <= 3)      mods.push("slender wispy body shape")
  else if (toughness <= 6) mods.push("normal rounded body shape")
  else                     mods.push("wide round plump body shape")

  if (speed <= 3)      mods.push("relaxed sitting pose, half-closed sleepy eyes")
  else if (speed <= 6) mods.push("sitting upright alert pose, open eyes")
  else                 mods.push("dynamic standing pose, one paw raised, wide alert eyes")

  return mods.join(", ")
}
```

**Rarity Enhancement Block** (appended based on rarity):

```javascript
const rarityBlocks = {
  common:
    "Simple clean design. 1-2 colors only. No patterns. No special effects.",

  rare:
    "Slightly more detailed design. 2-3 colors. Optional subtle pattern " +
    "(spots or stripes, symmetrical). One eye may have a small sparkle highlight.",

  epic:
    "Detailed distinctive design. 3-4 coordinated pastel colors. Symmetrical " +
    "pattern or ombre effect allowed. Eyes have longer lashes. Very subtle soft " +
    "outer glow (1px, pastel color matching fur).",

  legendary:
    "Striking memorable design. 4-5 carefully coordinated pastel colors. " +
    "Complex symmetrical pattern. Unique silhouette. Eyes are distinctive " +
    "(multiple iris colors or asymmetric detail). Subtle aura glow " +
    "(soft radial gradient, 3px, matching color scheme). " +
    "Tail has unique coloring or pattern."
}
```

**Full Assembled Example Prompt** (Epic cat, Power 7, Toughness 4, Speed 8, first breeding of this pair):

```
"Chibi kawaii cat illustration. Style: Hello Kitty by Sanrio, 
Tamagotchi, Pusheen. Medium: flat 2D digital art, hand-drawn 
aesthetic. NOT photorealistic, NOT 3D render, NOT anime-detailed. 
Proportions: oversized round head (50% of body height), tiny limbs, 
large oval eyes (35% of face width). Eyes: solid black iris, 
single white circular highlight dot at top-right of each iris. 
Face: minimal features, small dot nose, simple curved smile. 
Linework: thin consistent lines, no thick outlines. 
Color philosophy: pastel only, soft saturation, NO pure black, NO neon. 
Background: fully transparent. Canvas: 256x256px, cat centered, full body visible.

Fur: soft lavender base, rose cheeks accent.
Ears: pointed elf ears.
Tail: double-tip tail.
Eyes: violet eyes.
Mark: crescent moon marking on forehead.

sturdy strong-shouldered build, normal rounded body shape,
dynamic standing pose with one paw raised, wide alert eyes.

Detailed distinctive design. 3-4 coordinated pastel colors. 
Symmetrical pattern or ombre effect allowed. Eyes have longer lashes. 
Very subtle soft outer glow (1px, pastel matching fur)."
```

#### Variety Token Inheritance (Bred Cats)

```javascript
function selectVarietyTokens(parent1Tokens, parent2Tokens) {
  const traits = ['furBase', 'furAccent', 'earStyle', 'tailStyle', 'eyeColor', 'specialMark']

  return traits.reduce((offspring, trait) => {
    const roll = Math.random()
    if (roll < 0.40)      offspring[trait] = parent1Tokens[trait]          // 40% parent 1
    else if (roll < 0.80) offspring[trait] = parent2Tokens[trait]          // 40% parent 2
    else                  offspring[trait] = randomFromVocabulary(trait)   // 20% mutation
    return offspring
  }, {})
}
```

Most bred cats look visually related to their parents (recognizable lineage). ~20% of traits mutate each generation. Deep breeding chains create family lines players can trace. Mutations maintain surprise and prevent homogeneity.

#### Style Consistency Validator

Run after every bulk generation batch and optionally after individual AI generations:

```javascript
async function validateArtStyle(newImageUrl, referenceImageUrls) {
  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: `You are a kawaii art style validator. Compare the new cat image 
                 to the reference images. Rate consistency 1-10 on:
                 1. Chibi proportions (head 50% of body)
                 2. Pastel color palette (no neon, no pure black)
                 3. Thin consistent linework
                 4. Transparent background
                 5. Hello Kitty aesthetic (simple face, oval eyes)
                 Return JSON: {
                   overallScore: number,
                   scores: { proportions, palette, linework, background, aesthetic },
                   issues: string[],
                   approved: boolean  // true if overallScore >= 7
                 }`
        },
        { type: "image", source: { type: "url", url: newImageUrl } },
        ...referenceImageUrls.slice(0, 3).map(url => ({
          type: "image", source: { type: "url", url }
        }))
      ]
    }]
  })
  return JSON.parse(response.content[0].text)
}
```

Images scoring below 7 are flagged for manual review and not served to players.

---

## 5. Battle Screen — Complete Visual Specification

### 5.1 Screen Layout

**Background**: Soft pastel gradient (top: #E8D5FF lavender → bottom: #FFD6E8 baby pink). Permanent ambient particle system: tiny stars, hearts, and sparkles at 20% opacity, drifting upward slowly. Two arena zones separated by a thin dashed centerline (playful chalk-line aesthetic, not aggressive).

**Player Cat (Bottom Half)**:
- Position: 50% horizontal center, 65% down screen.
- Size: 192×192px (75% of full 256px).
- Always faces RIGHT toward opponent.
- Idle animation: gentle breathing — scale 100% → 103% → 100% on a 2-second ease-in-out loop.
- Drop shadow beneath feet: soft elliptical #00000022, 8px blur.
- Name label: rounded pill below cat, pastel pink background, white Nunito Bold 14px.
- Health bar: directly above cat, 120px wide × 10px tall, rounded ends. Animates green (#98FF98) → yellow (#FFD700) → red (#FF6B6B) as HP depletes. CSS width transition, 400ms ease-out.
- Rarity badge: small gem icon top-left of cat card. Common = gray, Rare = blue, Epic = purple, Legendary = gold.

**Opponent Cat (Top Half)**:
- Position: 50% horizontal center, 30% down screen.
- Size: 160×160px (slightly smaller — deliberate perspective trick making player feel slightly more powerful).
- Always faces LEFT toward player.
- Same idle animation, health bar, name label, rarity badge as player cat.

**Stat Readout**: Thin vertical strip on right edge. Three small icons stacked: ⚡ Power (#FF6B6B red-pink), 🛡️ Toughness (#87CEEB sky blue), 💨 Speed (#98FF98 mint green). Each shows stat number in white overlay. Both cats' values visible.

**Round Counter**: Center top, above opponent. Small rounded badge: "ROUND 1" in Quicksand Bold 12px, white text on #9B59B6 purple pill. Updates each round with scale-pop (100% → 120% → 100%, 200ms).

### 5.2 Attack Animation Sequence

**Wind-up** (0.2 sec): Attacking cat shifts back 8px (recoil), rotates -5 degrees, small dust puff particles at feet.

**Lunge** (0.15 sec): Cat slams 40px toward opponent with ease-out (very fast). Scale increases to 108%. Rotation snaps to +5 degrees (leaning forward). Motion blur trail: 3 ghost copies at 60%, 30%, 10% opacity, offset 12/24/36px behind.

**Impact** (0.1 sec): Defending cat shakes ±4px horizontal, 3 times in 150ms. Screen flash: white overlay 30% opacity, fades in 100ms. Impact particle burst at opponent position: 8 stars and hearts, pastel colors, explode outward in 360 degrees, travel 20–40px, fade over 400ms. Haptic: single sharp pulse 80ms intensity 0.7.

**Damage Number Float** (0.5 sec): Large number at impact point (e.g., "−7"). Nunito ExtraBold 28px, white text with #FF6B6B shadow. Floats up 30px, fades over 500ms. If evaded: "MISS!" in #FFD700 yellow. If critical hit (damage > 8): "CRITICAL!" text above number in #FF69B4 pink with extra star burst.

**Return** (0.2 sec): Attacker returns to original position, scale back to 100%, rotation to 0 degrees. Idle animation resumes. Defender health bar animates down (CSS transition, 400ms ease-out). Color zone transitions (green→yellow, yellow→red) trigger small crack particle and floating heart icon off the health bar.

**Opponent Attacks**: Mirror image of above. Haptic slightly softer (intensity 0.5) — subconsciously signals the opponent's hit matters less.

### 5.3 Victory Animation

1. Opponent faint (0.5 sec): Rotates 90 degrees clockwise, scale shrinks to 60%, slides slightly down, opacity fades to 0%. Three "zzz" bubbles float up (pastel purple "z" letters). Health bar collapses to gray.

2. Victory burst (1.0 sec): 40 confetti pieces fire from both sides — rounded rectangles (8×4px), assorted pastels (#FFB6D9, #ADD8E6, #BDFCC9, #FFD700), rotate while falling, gravity-simulated at varied rates (1.5–3 sec). Player cat performs happy dance: bounces up 20px, ears wiggle ±10 degrees, tail wags via skewX ±5 degrees. Subtle radial gradient burst (white, expands outward 0%→20%→0% opacity, 500ms). Haptic: double burst (100ms, 50ms gap, 150ms, intensity 0.9). Sound: ascending chime sequence C4→E4→G4→C5 over 400ms.

3. Result card slides up (0.5 sec): Bottom sheet from below screen, ease-out cubic bezier. Card shows "YOU WIN!" in Nunito ExtraBold 32px #FF69B4 pink. Player cat image (96×96px) + arrow icon + captured opponent cat image (96×96px). "+10 XP" and "+5 🐾" in small green text. "TAP ANYWHERE TO CONTINUE" pulsing in 12px gray.

### 5.4 Defeat Animation

1. Player cat faint (0.5 sec): Same faint animation as opponent defeat above.

2. Defeat fade (0.5 sec): Screen dims — dark overlay at 40% opacity, 300ms. No confetti. Deliberate contrast with victory. Haptic: single long low pulse (200ms, intensity 0.4). Sound: descending minor tone G4→E4→C4, 600ms, harmonic minor.

3. Result card slides up: "YOU LOST..." in Nunito ExtraBold 32px #9B59B6 muted purple. Player cat with small tear emoji overlay. "Your cat was taken!" in 14px gray. "BREED A NEW CAT →" button in pastel blue. "TAP ANYWHERE TO CONTINUE" in 12px gray.

---

## 6. Breeding Screen — Complete Visual Specification

### 6.1 Screen Layout

**Background**: Warm gradient (top: #FFF0F5 lavender blush → bottom: #FFE4E1 misty rose). Ambient particle system: slow-drifting hearts (♥) and tiny flowers (✿) at 15% opacity, very slow upward drift. Always running as mood-setter.

**Cat Selection Area**: Two large "Cat Slots" centered horizontally, side by side. Each slot: 140×140px rounded rectangle with dashed pastel border (#FFB6D9, 2px dashes). Empty state: faint "+" icon (40px, #FFB6D9), label "Choose Cat" in 12px gray. Filled state: selected cat image fills the slot, name label below, rarity gem in top-right corner. Between the slots: a small heart icon (♥) in #FF69B4, 24px, static until breed initiated.

**Breed Button**: 160px wide × 48px tall, rounded, gradient #FF69B4 → #FF8FAB. White text "BREED ✨" in Nunito Bold 16px. Currency cost "Cost: 50 🐾" shown below in 12px gray. If either cat is in cooldown: slot shows a ⏰ clock icon overlay with "Ready in Xm" text. Breed button disabled (gray, unclickable).

### 6.2 Breeding Animation Sequence (4 seconds total)

**Phase 1 — Cats Approach** (0.8 sec): Both cat images slide toward center from their slots (ease-in-out cubic bezier). Hearts generate between the cats as they close, increasing in frequency. Haptic: gentle rhythmic pulse (50ms every 300ms × 3, intensity 0.3).

**Phase 2 — Heart Burst** (0.6 sec): When cats "meet" at center — both scale to 110% with cartoon squish (scaleX 90%, scaleY 110%, return). Large heart burst: 12 hearts (#FF69B4, #FFB6D9, #FF8FAB) explode outward, travel 40–80px, fade. Screen briefly tints pink (20% opacity overlay, in 100ms, out 200ms). Haptic: double pulse (100ms, 50ms gap, 100ms, intensity 0.6). Sound: soft C major piano chord.

**Phase 3 — Magic Swirl** (1.5 sec): Both parent cats shrink and orbit the center point clockwise (circular CSS animation, 40px radius). Each leaves a color trail (blur + opacity fade). At center: a glowing orb appears and pulses (radial gradient white core → #FF69B4 edge, 60px diameter, scale 80%→120%→80% on 600ms loop). Sparkle particles spawn continuously from the orb (8-pointed stars, pastel rainbow cycling). Haptic: continuous light vibration (30ms every 150ms, intensity 0.4). Sound: ascending harmonic sparkle (layered high-pitched notes building in density, music box feel).

**Phase 4 — Reveal** (1.1 sec): Parent cats fade out (300ms). Orb expands dramatically (scale 1 → 3, 400ms ease-out). Screen flash: white at 80% opacity, in 150ms. Flash clears to reveal the new cat at 200×200px, centered. Cat scales in 0% → 110% → 100% (overshoot spring animation, cubic-bezier(0.34, 1.56, 0.64, 1)). Confetti burst. If FIRST TIME this pair has bred: gold shimmer ripple outward (#FFD700, expands to full screen, fades) + "✨ NEW CAT DISCOVERED!" banner slides in from top (pastel gold background, Nunito ExtraBold 18px white text). Haptic: strong celebratory burst (150ms, intensity 0.95). Sound: full ascending scale C4→D→E→F→G→A→B→C5 then C major chord, 1.5 sec total.

**Result Card**: New cat at top (200×200px). Cat name in Nunito ExtraBold 24px #FF69B4. Rarity badge in rarity-appropriate color. Three stat pills in a row: ⚡ Power (red-pink pill), 🛡️ Toughness (sky blue pill), 💨 Speed (mint green pill). Parent lineage: "Child of [Parent1 Name] × [Parent2 Name]" in 10px gray italic. Two buttons: "ADD TO ROSTER" (primary, pastel pink, full width) and "SHARE" (ghost button, "Share your new cat!").

---

## 7. Home Screen — Complete Visual Specification

**Top Bar**: Left: player avatar (32×32px circle, default kawaii face icon). Center: "DOKI" wordmark (custom rounded font, gradient #FF69B4 → #FF8FAB, 24px). Right: currency display (coin icon + number, Nunito Bold 14px, #FFD700).

**Active Cat Display**: Current active cat at 180×180px, centered horizontally at 40% down screen. Idle bob animation (translateY 0 → -6px → 0, 2 sec ease-in-out loop). Accessories render on top (see Accessory System). Cat name in Nunito Bold 16px below. Tap the cat: small bounce reaction (scale 100%→90%→110%→100%, 300ms spring) + one heart particle floats up.

**Four Action Buttons** (2×2 grid, bottom 40% of screen): Each 156×80px with rounded corners (16px radius) and soft drop shadow. All buttons scale to 94% on tap (spring back to 100%, 200ms) with light haptic (40ms pulse).
- BATTLE (top-left): Gradient #FF6B6B → #FF8FAB. ⚔️ icon + "BATTLE" label.
- BREED (top-right): Gradient #FF69B4 → #FFB6D9. 💕 icon + "BREED" label.
- LOOT BOX (bottom-left): Gradient #FFD700 → #FFA500. 🎁 icon + "LOOT BOX" label.
- ROSTER (bottom-right): Gradient #87CEEB → #ADD8E6. 📋 icon + "ROSTER" label.

---

## 8. Loot Box System — Complete Visual & Mechanical Specification

### 8.1 Pull Algorithm

```javascript
async function executePull(userId, pullType) {
  const cost = pullType === 'single' ? 100 : 900
  const pullCount = pullType === 'single' ? 1 : 10
  const results = []

  return await db.transaction(async trx => {
    await deductCurrency(userId, cost, trx)

    for (let i = 0; i < pullCount; i++) {
      const user = await User.findById(userId, trx)
      let rarity = checkPity(user)
      if (!rarity) rarity = weightedRarityRoll()
      updatePityCounters(user, rarity, trx)
      const cat = await generateLootBoxCat(userId, rarity, trx)
      results.push(cat)
    }

    return results
  })
}

function weightedRarityRoll() {
  const roll = Math.random() * 100
  if (roll < 3)  return 'legendary'   // 3%
  if (roll < 15) return 'epic'        // 12%
  if (roll < 40) return 'rare'        // 25%
  return 'common'                      // 60%
}

function checkPity(user) {
  if (user.pity_counter_legendary >= 99) return 'legendary'
  if (user.pity_counter_epic >= 49)      return 'epic'
  return null
}
```

### 8.2 Catalog-Based Generation

Loot box cats draw from a pre-generated master catalog rather than generating at pull time. This eliminates pull latency (AI generation takes 3–8 seconds; loot box should feel instant).

```javascript
async function generateLootBoxCat(userId, rarity, trx) {
  const variety    = VARIETIES[randomInt(0, VARIETIES.length - 1)]
  const catalogCat = await CatalogCat.findRandom({ rarity, variety }, trx)
  const stats      = generateStatsForRarity(rarity)

  return await Cat.create({
    owner_id: userId,
    name: catalogCat.name,
    base_image_url: catalogCat.image_url,
    variety_tokens: catalogCat.variety_tokens,
    rarity, variety,
    ...stats,
    generation: 0,
    acquired_via: 'loot_box'
  }, trx)
}
```

Catalog targets: 200 Common, 150 Rare, 100 Epic, 50 Legendary (500 total). Generated offline in bulk via the content pipeline before launch.

### 8.3 Loot Box Screen Layout

**Background**: Deep soft purple gradient (top: #2D1B69 → bottom: #4A1942). 100 twinkling stars (tiny white dots, opacity pulses 20%→80%→20% at random intervals 1–4 seconds, staggered). Two large radial gradient nebula blobs (#FF69B4 and #87CEEB, 30% opacity, 400px diameter) drifting very slowly (60 seconds to traverse screen).

**Loot Box Object**: 180×180px kawaii gift box — pastel pink body with white polka dots, gold ribbon and bow. Gentle bob (translateY 0→-8px→0, 2.5 sec loop). Bow rotates ±3 degrees in sync. Six sparkle particles orbit slowly (full rotation every 4 seconds, 40px radius). "OPEN BOX" button: 200×56px, gradient #FFD700→#FFA500, Nunito ExtraBold 18px white, 28px border radius. Subtle pulsing glow on button (box-shadow expands/contracts every 1.5 sec). "10× PULL — 900 🐾 (SAVE 10%)" secondary button below.

### 8.4 Pull Animations by Rarity

**Common Pull** (1.5 sec): Box shakes ±5px 3 times (300ms) → lid pops open (rotateX 0→-80 degrees, 200ms) → cat pops out (scale 0→1, translateY up 60px, 400ms spring) → soft pastel sparkle burst (8 particles, 30px outward, 500ms fade) → result card fades in. Haptic: single pulse 60ms intensity 0.5. Sound: soft pop + piano C4 (200ms).

**Rare Pull** (2.0 sec): Box shakes ±8px 5 times → blue glow (box-shadow #87CEEBaa, 300ms) → lid flips dramatically (rotateX 0→-100 degrees) → cat emerges with upward float (scale 0→1.1→1, 80px up, 500ms overshoot spring) → blue sparkle burst (12 particles, 50px, 600ms) → musical note floats up (♪ #87CEEB). Haptic: double pulse (80ms, 40ms gap, 80ms, intensity 0.65). Sound: ascending two-note chime C4→G4.

**Epic Pull** (2.8 sec): Box shakes violently ±12px horizontal + ±6px vertical, irregular (700ms) → screen dims to 85% → purple lightning crackles around box (CSS pseudo-elements, #9B59B6, 4 bolts flashing for 500ms) → box shatters (4 pieces fly to screen corners, each rotates and fades, 300ms) → cat materializes dramatically (scale 0→1.2→1.0, 600ms spring, with motion blur) → purple/gold particle explosion (24 particles, stars and diamonds, #9B59B6 and #FFD700, 80px outward, 800ms) → screen flash purple 40% opacity → "EPIC!" text bursts from center (Nunito ExtraBold 48px #9B59B6, scale 0→2→0, 600ms). Haptic: triple burst (120ms, 40ms, 120ms, 40ms, 80ms, intensity 0.85). Sound: full C major scale in 400ms + chord.

**Legendary Pull** (4.0 sec): Box builds to intense gold aura (800ms) → screen dims to 60% → box levitates 30px, rotating ±5 degrees → gold lightning strikes from all four corners (400ms) → screen whiteout flash (100% opacity, 300ms) → cat revealed LARGE (240px), centered, surrounded by gold aura (radial gradient 200px radius, #FFD70044) → rainbow particle cascade (40 particles, full spectrum pastel rainbow, 100px travel, 1 sec) → two expanding star burst rings (CSS circles, scale 0→300%, #FFD700, staggered 200ms) → "LEGENDARY!!!" text thunders in from top (Nunito ExtraBold 40px gold gradient, scale 1.5→1.0, then pulses glow) → cat continues gentle bounce loop until dismissed. Haptic: full rumble sequence (200ms heavy, 50ms, 150ms heavy, 50ms, 200ms heavy, intensity 1.0). Sound: 4-second orchestral fanfare, C major key, cinematic trumpet/strings blend.

---

## 9. Accessory System

### 9.1 Design Principles

Accessories layer on top of base cat art without altering the cat's core design. All accessories must visually fit all cats. They are purely cosmetic — no effect on battle or breeding stats.

**All accessories must**: use the same kawaii chibi style as cats (not realistic, not photorealistic), use the same pastel color palette, have transparent backgrounds (PNG alpha), be sized to fit any cat's proportions (scaled dynamically), and NOT obscure the cat's face, tail, or core silhouette.

### 9.2 Five Accessory Slots

1. **Head Slot**: Hats, headbands, hair clips, crowns, bows. Sits on top of head without covering eyes.
2. **Body Slot**: Shirts, vests, dresses, jackets. Overlays on chest/torso.
3. **Waist Slot**: Belts, aprons, tail wraps. Hangs around neck area or tail base.
4. **Back Slot**: Wings, backpacks, capes. Positioned at shoulder blades, doesn't cover tail.
5. **Paw Slot**: Shoes, socks, bracelets, gloves. Scaled per cat size.

### 9.3 Rendering Architecture

**Z-Index Layering Order** (back to front):

1. Base cat image (z-index: 0)
2. Back slot accessory (z-index: 1) — wings, backpacks go behind cat torso
3. Body slot accessory (z-index: 2) — shirts overlay cat body
4. Waist slot accessory (z-index: 3) — belts wrap around hips
5. Paw slot accessory (z-index: 4) — shoes on feet
6. Head slot accessory (z-index: 5) — hats always on top

**Accessory Metadata Schema**:

```json
{
  "accessory_id": "strawberry_hat_001",
  "slot": "head",
  "attachment_point": {
    "x_offset_percent": 50,
    "y_offset_percent": 10,
    "scale_factor": 0.9
  },
  "z_index": 5,
  "rotation_degrees": -5
}
```

**CSS Implementation**:

```css
.cat-container {
  position: relative;
  width: 256px;
  height: 256px;
}

.cat-base {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.accessory {
  position: absolute;
  pointer-events: none;
  transform: translate(var(--offset-x), var(--offset-y))
             scale(var(--scale))
             rotate(var(--rotation));
}

.accessory.slot-head  { z-index: 5; }
.accessory.slot-back  { z-index: 1; }
.accessory.slot-body  { z-index: 2; }
.accessory.slot-waist { z-index: 3; }
.accessory.slot-paw   { z-index: 4; }
```

**Dynamic Scaling by Rarity**: Common = 100%, Rare = 105%, Epic = 110%, Legendary = 115%. Prevents accessories from looking disproportionate on larger, rarer cats.

### 9.4 Accessory AI Generation (Future Pipeline)

```
"A [color] pastel kawaii [accessory_type] suitable for a cute chibi cat.
Style: Hello Kitty aesthetic, hand-drawn, chibi.
Color: [color_name] pastel, avoid pure black and neon.
Symmetry: [symmetrical/asymmetrical].
Size: Should fit a cat [head/body/waist/back/paws] without obscuring the cat.
Background: Transparent PNG. No text, no complex details, simple and adorable.
256x256px, isolated item."
```

---

## 10. Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
  user_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username                 VARCHAR(32) UNIQUE NOT NULL,
  display_name             VARCHAR(64),
  avatar_url               TEXT,
  virtual_currency         INTEGER DEFAULT 500,
  roster_capacity          INTEGER DEFAULT 30,
  battle_wins              INTEGER DEFAULT 0,
  battle_losses            INTEGER DEFAULT 0,
  total_breeds             INTEGER DEFAULT 0,
  total_pulls              INTEGER DEFAULT 0,
  pity_counter_epic        INTEGER DEFAULT 0,
  pity_counter_legendary   INTEGER DEFAULT 0,
  elo_rating               INTEGER DEFAULT 1000,
  login_streak             INTEGER DEFAULT 0,
  last_login_date          DATE,
  player_level             INTEGER DEFAULT 1,
  player_xp                INTEGER DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  last_active              TIMESTAMPTZ DEFAULT NOW()
);

-- CATS
CREATE TABLE cats (
  cat_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID REFERENCES users(user_id) ON DELETE SET NULL,
  name                  VARCHAR(64) NOT NULL,
  rarity                VARCHAR(12) CHECK (rarity IN ('common','rare','epic','legendary')) NOT NULL,
  variety               VARCHAR(12) CHECK (variety IN ('whisker','paws','fluff','shadow','spark')) NOT NULL,
  power                 INTEGER CHECK (power BETWEEN 1 AND 10) NOT NULL,
  toughness             INTEGER CHECK (toughness BETWEEN 1 AND 10) NOT NULL,
  speed                 INTEGER CHECK (speed BETWEEN 1 AND 10) NOT NULL,
  xp                    INTEGER DEFAULT 0,
  cat_level             INTEGER DEFAULT 1,
  generation            INTEGER DEFAULT 0,
  parent1_id            UUID REFERENCES cats(cat_id) ON DELETE SET NULL,
  parent2_id            UUID REFERENCES cats(cat_id) ON DELETE SET NULL,
  breed_pair_hash       VARCHAR(128) UNIQUE,
  base_image_url        TEXT NOT NULL,
  variety_tokens        JSONB,
  cooldown_until        TIMESTAMPTZ,
  is_in_battle          BOOLEAN DEFAULT FALSE,
  battle_wins           INTEGER DEFAULT 0,
  battle_losses         INTEGER DEFAULT 0,
  times_transferred     INTEGER DEFAULT 0,
  acquired_via          VARCHAR(16) CHECK (acquired_via IN ('loot_box','breeding','battle_win')) NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ACCESSORY SLOTS (one row per cat per slot)
CREATE TABLE cat_accessories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id         UUID REFERENCES cats(cat_id) ON DELETE CASCADE,
  slot           VARCHAR(8) CHECK (slot IN ('head','body','waist','back','paw')) NOT NULL,
  accessory_id   UUID REFERENCES accessories(accessory_id) ON DELETE SET NULL,
  equipped_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cat_id, slot)
);

-- ACCESSORIES MASTER TABLE
CREATE TABLE accessories (
  accessory_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(64) NOT NULL,
  slot                  VARCHAR(8) CHECK (slot IN ('head','body','waist','back','paw')) NOT NULL,
  rarity                VARCHAR(12) CHECK (rarity IN ('common','rare','epic','legendary')) NOT NULL,
  image_url             TEXT NOT NULL,
  attachment_x_percent  FLOAT NOT NULL,
  attachment_y_percent  FLOAT NOT NULL,
  scale_factor          FLOAT DEFAULT 1.0,
  z_index               INTEGER NOT NULL,
  rotation_degrees      FLOAT DEFAULT 0,
  description           TEXT,
  is_available          BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- USER ACCESSORY INVENTORY
CREATE TABLE user_accessories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(user_id) ON DELETE CASCADE,
  accessory_id   UUID REFERENCES accessories(accessory_id),
  quantity       INTEGER DEFAULT 1,
  acquired_via   VARCHAR(16) CHECK (acquired_via IN ('loot_box','purchase','event')) NOT NULL,
  acquired_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, accessory_id)
);

-- BREED CACHE (deterministic AI generation results)
CREATE TABLE breed_cache (
  breed_pair_hash      VARCHAR(128) PRIMARY KEY,
  parent1_id           UUID REFERENCES cats(cat_id),
  parent2_id           UUID REFERENCES cats(cat_id),
  generated_name       VARCHAR(64) NOT NULL,
  generated_image_url  TEXT NOT NULL,
  rarity               VARCHAR(12) NOT NULL,
  power_base           INTEGER NOT NULL,
  toughness_base       INTEGER NOT NULL,
  speed_base           INTEGER NOT NULL,
  variety              VARCHAR(12) NOT NULL,
  variety_tokens       JSONB,
  ai_prompt_used       TEXT,
  generation_model     VARCHAR(64),
  is_fallback          BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- BATTLES
CREATE TABLE battles (
  battle_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id         UUID REFERENCES users(user_id),
  player2_id         UUID REFERENCES users(user_id),
  player1_cat_id     UUID REFERENCES cats(cat_id),
  player2_cat_id     UUID REFERENCES cats(cat_id),
  winner_id          UUID REFERENCES users(user_id),
  loser_id           UUID REFERENCES users(user_id),
  winning_cat_id     UUID REFERENCES cats(cat_id),
  losing_cat_id      UUID REFERENCES cats(cat_id),
  rounds_played      INTEGER,
  battle_log         JSONB,
  is_pvp             BOOLEAN DEFAULT FALSE,
  resolution_type    VARCHAR(16) DEFAULT 'normal',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- CATALOG CATS (pre-generated loot box pool)
CREATE TABLE catalog_cats (
  catalog_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(64) NOT NULL,
  rarity           VARCHAR(12) NOT NULL,
  variety          VARCHAR(12) NOT NULL,
  image_url        TEXT NOT NULL,
  variety_tokens   JSONB NOT NULL,
  style_score      FLOAT,
  is_available     BOOLEAN DEFAULT TRUE,
  times_served     INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- CURRENCY TRANSACTIONS
CREATE TABLE currency_transactions (
  transaction_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(user_id),
  amount             INTEGER NOT NULL,
  transaction_type   VARCHAR(32) CHECK (transaction_type IN (
    'loot_box_pull','battle_reward','breed_cost',
    'daily_bonus','purchase','achievement_reward',
    'cooldown_skip','roster_expansion','refund'
  )) NOT NULL,
  reference_id       UUID,
  balance_after      INTEGER NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ACHIEVEMENTS
CREATE TABLE user_achievements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(user_id) ON DELETE CASCADE,
  achievement_id   VARCHAR(64) NOT NULL,
  unlocked_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- FAILED GENERATIONS (for retry queue)
CREATE TABLE failed_generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_pair_hash  VARCHAR(128),
  rarity        VARCHAR(12),
  variety       VARCHAR(12),
  prompt_used   TEXT,
  error_message TEXT,
  resolved      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_cats_owner_id    ON cats(owner_id);
CREATE INDEX idx_cats_rarity      ON cats(rarity);
CREATE INDEX idx_cats_cooldown    ON cats(cooldown_until);
CREATE INDEX idx_battles_players  ON battles(player1_id, player2_id);
CREATE INDEX idx_battles_created  ON battles(created_at DESC);
CREATE INDEX idx_users_elo        ON users(elo_rating DESC);
CREATE INDEX idx_users_active     ON users(last_active DESC);
CREATE INDEX idx_catalog_rarity   ON catalog_cats(rarity, variety, is_available);
```

---

## 11. API Architecture

### 11.1 All Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/refresh

GET    /api/users/:user_id
PATCH  /api/users/:user_id
GET    /api/users/:user_id/roster
GET    /api/users/:user_id/achievements

GET    /api/cats/:cat_id
PATCH  /api/cats/:cat_id/accessory         (equip)
DELETE /api/cats/:cat_id/accessory/:slot   (unequip)
GET    /api/cats/:cat_id/lineage           (full breeding ancestry tree)

POST   /api/battles/initiate
GET    /api/battles/:battle_id
POST   /api/battles/:battle_id/complete

POST   /api/breed/initiate
GET    /api/breed/cache/:pair_hash

POST   /api/lootbox/pull

GET    /api/accessories
GET    /api/accessories/inventory/:user_id

GET    /api/leaderboard/global
GET    /api/leaderboard/weekly

POST   /api/currency/purchase
POST   /api/currency/daily-bonus
```

### 11.2 Rate Limiting

```javascript
const rateLimits = {
  '/api/battles/initiate':  { windowMs: 60000, max: 20 },   // 20 battles/min
  '/api/breed/initiate':    { windowMs: 60000, max: 10 },   // 10 breeds/min
  '/api/lootbox/pull':      { windowMs: 60000, max: 5  },   // 5 pulls/min
  '/api/auth/register':     { windowMs: 60000, max: 3  },   // 3 registrations/min per IP
}
```

### 11.3 Currency Atomicity (Critical)

All currency operations must be atomic database transactions. Never deduct currency and create cats in separate operations:

```javascript
async function deductCurrency(userId, amount, trx) {
  const result = await db('users')
    .where({ user_id: userId })
    .where('virtual_currency', '>=', amount)
    .decrement('virtual_currency', amount)
    .transacting(trx)
    .returning('virtual_currency')

  if (result.length === 0) throw new Error('INSUFFICIENT_CURRENCY')
  return result[0].virtual_currency
}
```

---

## 12. Progression System

### 12.1 Cat XP & Level (Cosmetic Only)

Stats are fixed at creation. XP is purely cosmetic and creates attachment without enabling pay-to-win.

```
Level 1:   0 XP    (default)
Level 2:   50 XP   (sparkle badge on cat card)
Level 3:   150 XP  (gold border on cat card)
Level 4:   300 XP  (animated shimmer on cat card)
Level 5:   500 XP  (legendary glow + "Veteran" title on cat card)
```

A Level 5 veteran cat you have battled 50 times is psychologically costly to lose. This makes battles feel more meaningful without affecting balance.

### 12.2 Player Level

```javascript
function calculatePlayerLevel(user) {
  const score = (user.battle_wins * 10) + (user.total_breeds * 15) + (user.total_pulls * 5)
  return Math.floor((-1 + Math.sqrt(1 + 8 * score / 50)) / 2)
}
```

**Level Rewards**:
- Level 5: +5 roster capacity
- Level 10: Daily free pull (1 Common every 24 hours)
- Level 15: +5 roster capacity
- Level 20: Unlock PvP ranked mode
- Level 25: Breeding cooldown reduced by 15 minutes
- Level 30: Unlock Legacy Breed (breed a cat with its own offspring)

### 12.3 Daily Login Bonus

```
Day 1:  50 Pawcoin
Day 2:  75 Pawcoin
Day 3:  1 Common cat pull
Day 4:  100 Pawcoin
Day 5:  1 Rare cat pull
Day 6:  150 Pawcoin
Day 7:  1 Epic cat pull (guaranteed)
Day 8+: Cycle repeats from Day 1
```

### 12.4 Achievements

```javascript
const ACHIEVEMENTS = [
  { id: 'first_pull',      name: 'First Catch!',       reward: 50  },
  { id: 'first_battle',    name: 'First Fight!',        reward: 50  },
  { id: 'first_breed',     name: 'First Family!',       reward: 75  },
  { id: 'cats_10',         name: 'Clowder',             reward: 100 },
  { id: 'cats_25',         name: 'Cat Lady/Lad',        reward: 200 },
  { id: 'first_rare',      name: 'Rare Find',           reward: 75  },
  { id: 'first_epic',      name: 'Epic Day',            reward: 150 },
  { id: 'first_legendary', name: 'Legendary!',          reward: 300 },
  { id: 'wins_10',         name: 'Fighter',             reward: 100 },
  { id: 'wins_50',         name: 'Champion',            reward: 200 },
  { id: 'wins_100',        name: 'Warrior',             reward: 300 },
  { id: 'steal_epic',      name: 'Epic Heist',          reward: 200 },
  { id: 'steal_legendary', name: 'Legendary Theft',     reward: 500 },
  { id: 'breeds_10',       name: 'Mad Scientist',       reward: 100 },
  { id: 'breeds_50',       name: 'Breeder',             reward: 200 },
  { id: 'breed_legendary', name: 'Born Legendary',      reward: 400 },
  { id: 'new_discovery',   name: 'Discovery!',          reward: 250 },
  { id: 'streak_7',        name: 'Weekly Warrior',      reward: 150 },
  { id: 'streak_30',       name: 'Monthly Master',      reward: 500 },
]
```

---

## 13. PvP System

### 13.1 Matchmaking

```javascript
async function findPvPOpponent(userId, userCatId) {
  const user    = await User.findById(userId)
  const userCat = await Cat.findById(userCatId)
  const catScore = userCat.power + userCat.toughness + userCat.speed

  const candidates = await User.findAll({
    where: {
      user_id:     { $ne: userId },
      elo_rating:  { $between: [user.elo_rating - 100, user.elo_rating + 100] },
      last_active: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    },
    limit: 20
  })

  for (const candidate of candidates) {
    const candidateCat   = await getActiveCat(candidate.user_id)
    const candidateScore = candidateCat.power + candidateCat.toughness + candidateCat.speed
    if (Math.abs(candidateScore - catScore) <= 3) {
      return { opponent: candidate, opponentCat: candidateCat }
    }
  }

  return findWidenedMatch(userId, userCat)  // Fallback: ±200 ELO
}
```

### 13.2 ELO Update

```javascript
function updateElo(winnerElo, loserElo) {
  const K = 32
  const expected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  return {
    newWinnerElo: Math.round(winnerElo + K * (1 - expected)),
    newLoserElo:  Math.round(loserElo  + K * (0 - (1 - expected)))
  }
}
```

### 13.3 Weekly Leaderboard Rewards

```
1st Place:   1 Legendary pull + 500 Pawcoin
2nd Place:   1 Epic pull + 300 Pawcoin
3rd Place:   1 Rare pull + 150 Pawcoin
Top 10:      100 Pawcoin
Top 100:     50 Pawcoin
```

Seasonal reset every Monday 00:00 UTC.

---

## 14. Monetization Strategy

### 14.1 Virtual Currency Economy ("Pawcoin" 🐾)

**Earning (Free)**:
```
Daily login bonus:     50–150 Pawcoin (7-day cycle)
Battle win reward:     5 Pawcoin per win
Weekly leaderboard:    50–500 Pawcoin (rank dependent)
Level-up bonus:        100 Pawcoin per player level
Achievement rewards:   25–500 Pawcoin
```

**Spending**:
```
Single loot box pull:  100 Pawcoin
10x loot box pull:     900 Pawcoin (10% discount)
Breeding:              50 Pawcoin per breed
Roster expansion:      200 Pawcoin per +5 slots
Breed cooldown skip:   25 Pawcoin per cat
Cat rename:            10 Pawcoin
```

**Economy Balance**: Average free player earns ~100 Pawcoin/day, spends ~150/day (1 pull + 1 breed). Slight deficit (~50/day) encourages occasional purchase without being aggressive.

### 14.2 Real Money Purchase Tiers

```
Starter Pack:    $0.99   →  150 Pawcoin + 1 guaranteed Rare cat
Value Pack:      $4.99   →  900 Pawcoin + 1 guaranteed Epic cat
Mega Pack:       $9.99   →  2,200 Pawcoin + 1 guaranteed Epic + 1 random accessory
Ultra Pack:      $19.99  →  5,000 Pawcoin + 1 guaranteed Legendary + 3 accessories
Monthly Pass:    $4.99/mo → 100 Pawcoin/day + double login bonus + 1 exclusive monthly cat
```

**First Purchase Bonus**: First real-money purchase of any tier gets +50% Pawcoin bonus. One-time only. "Offer expires in 48 hours" timer (genuine).

---

## 15. Analytics & Instrumentation

### 15.1 Core Events

```javascript
// All sent to PostHog

analytics.track('app_opened',           { user_id, session_id, platform })
analytics.track('registration_completed', { user_id, method })

analytics.track('lootbox_opened', {
  user_id, pull_type, rarity_result,
  pity_counter_at_pull, currency_spent, currency_balance_after
})

analytics.track('battle_initiated', {
  user_id, player_cat_id, opponent_cat_id,
  player_cat_score, opponent_cat_score, is_pvp
})

analytics.track('battle_completed', {
  battle_id, winner_id, loser_id, rounds_played,
  cat_transferred_rarity, elo_change
})

analytics.track('breed_initiated', {
  user_id, parent1_id, parent2_id,
  was_cached, result_rarity, currency_spent
})

analytics.track('new_cat_generated', {
  breed_pair_hash, generation_time_ms, ai_model_used
})

analytics.track('purchase_completed', { user_id, pack_type, price_usd, pawcoin_received })

analytics.track('session_ended', { user_id, session_duration_sec, actions_taken })
```

### 15.2 Key Metrics

**Daily Health**: DAU, DAU/MAU ratio (target >40%), average session length (target 45–90 sec), sessions per user per day (target 3–5), D1/D7/D30 retention (targets: 40%/20%/10%).

**Economy**: Daily Pawcoin earned vs spent, pull rate per DAU (target >1), breed rate per DAU (target >0.5), battle rate per DAU (target >3).

**Monetization**: ARPU, ARPPU, conversion rate (target 3–5%), revenue by pack tier, LTV by cohort.

**Funnel**: Registration → First Pull → First Battle → First Breed → First Purchase. Track drop-off at each step.

---

## 16. Edge Cases & Error Handling

### 16.1 Battle Edge Cases

Same-round double KO: Higher Speed wins the tiebreaker. Perfect Speed tie: coin flip. Display "CLOSE CALL!" banner.

Infinite battle prevention (round > 50): Cat with higher HP percentage wins. Display "ENDURANCE WIN!" banner.

Opponent cat locked during simultaneous battles:

```javascript
async function lockCatForBattle(catId, trx) {
  const result = await db('cats')
    .where({ cat_id: catId, is_in_battle: false })
    .update({ is_in_battle: true })
    .transacting(trx)
    .returning('*')

  if (result.length === 0) throw new Error('CAT_ALREADY_IN_BATTLE')
  return result[0]
}
```

### 16.2 Breeding Edge Cases

Same cat selected twice: throw `CANNOT_BREED_WITH_SELF`. UI: "A cat can't breed with itself! 🙈"

Parent transferred during async breed flow:

```javascript
async function validateParentOwnership(userId, p1Id, p2Id, trx) {
  const [p1, p2] = await Promise.all([
    Cat.findOne({ cat_id: p1Id, owner_id: userId }, trx),
    Cat.findOne({ cat_id: p2Id, owner_id: userId }, trx)
  ])
  if (!p1 || !p2) {
    await refundCurrency(userId, 50, trx)
    throw new Error('PARENT_NO_LONGER_OWNED')
  }
}
```

AI generation failure: retry once after 2 seconds, then fall back to closest catalog cat. Log to `failed_generations` table for manual regeneration.

### 16.3 Network & Offline Handling

```javascript
async function submitBattleResult(battleId, result) {
  try {
    await api.post('/battles/complete', { battleId, result })
  } catch (err) {
    await offlineQueue.push({ type: 'BATTLE_RESULT', data: { battleId, result } })
  }
}

// Idempotency: server-side
async function completeBattle(battleId, result) {
  const existing = await Battle.findOne({ battle_id: battleId, status: 'completed' })
  if (existing) return existing  // Already processed, return cached result
  return await processBattleResult(battleId, result)
}
```

---

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

## 18. Build Order for Claude Code

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
- AI generation pipeline scoring ≥7 on style validator
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
- App icon finalized (1024×1024)
- App Store screenshots (6.7" and 6.1" iPhone, 12.9" iPad)
- App Store description and keywords finalized
- Privacy policy and terms of service published

**Soft Launch Targets** (Philippines + Canada, weeks 1–2):
- D1 retention ≥ 35%
- D7 retention ≥ 18%
- Average session length ≥ 40 seconds
- Sessions per user per day ≥ 3
- First purchase conversion ≥ 2%
- Crash-free rate ≥ 99%

If targets met: global launch. If D1 retention < 30%: review onboarding. If session length < 30 sec: review animation pacing. If conversion < 1.5%: review Starter Pack pricing and offer timing.

---

## 21. Post-Launch Roadmap

**Month 1 — Stability**: Fix crash bugs and edge cases from real users. Monitor economy balance. A/B test first purchase offer timing.

**Month 2 — Engagement**: Launch Season 1 (monthly leaderboard + exclusive seasonal cat reward). Add 10 new accessories. Add "Favorite" cat feature (one cat cannot be taken in battle).

**Month 3 — Monetization**: Launch Accessory Shop (50 accessories purchasable with Pawcoin). Launch Battle Pass ($4.99/month: exclusive cat + 10 accessories + 2× daily bonus). Add "Cat Showcase" profile page (shareable to social media).

**Month 4 — Social**: Friend system (add friends, view rosters). Friendly battle mode (challenge friends directly, no cat transfer). Guild system (5-player groups, weekly guild leaderboard).

**Month 6 — Expansion**: "Legendary Lineage" (trace full breeding ancestry of any cat). Limited-time event cats (Halloween, Christmas, Valentine's Day). Trading system (swap cats with friends, Pawcoin fee).

---

*End of DOKI Technical PRD v3. Total scope: full game design, complete art direction, AI prompt engineering system, accessory architecture, database schema, API specification, animation scripts, monetization strategy, analytics instrumentation, edge case handling, build order, and launch checklist. Ready for autonomous build via Claude Code.*