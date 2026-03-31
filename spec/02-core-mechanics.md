# 3. Core Mechanics

## 3.1 The Three Attributes

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

## 3.2 Battle System

### Battle Flow Algorithm

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

### Damage Formula

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

### Battle Resolution

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

### Tie Resolution

```javascript
if (playerCat.current_hp <= 0 && opponentCat.current_hp <= 0) {
  if (playerCat.speed > opponentCat.speed) winner = playerCat
  else if (opponentCat.speed > playerCat.speed) winner = opponentCat
  else winner = Math.random() < 0.5 ? playerCat : opponentCat
  // Display: "CLOSE CALL!" banner
}
```

## 3.3 Breeding System

### Prerequisites

Player must own both cats. Both cats must not be in cooldown (one breed per cat per 60 minutes). Player must have ≥ 50 Pawcoin.

### Stat Inheritance

```javascript
function breedStats(parent1, parent2) {
  return {
    power:     CLAMP(Math.floor((parent1.power     + parent2.power)     / 2) + randomInt(-2, 2), 1, 10),
    toughness: CLAMP(Math.floor((parent1.toughness + parent2.toughness) / 2) + randomInt(-2, 2), 1, 10),
    speed:     CLAMP(Math.floor((parent1.speed     + parent2.speed)     / 2) + randomInt(-2, 2), 1, 10)
  }
}
```

### Rarity Escalation

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

### Breed Pair Hash (Order-Independent)

```javascript
function hashBreedPair(catId1, catId2) {
  const sorted = [catId1, catId2].sort()
  return SHA256(sorted[0] + ':' + sorted[1]).toString()
  // Breeding A×B always equals B×A
}
```

### Full Breed Flow

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

### AI Generation Timeout Handling

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
