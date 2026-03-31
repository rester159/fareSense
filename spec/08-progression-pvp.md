# 12. Progression System

## 12.1 Cat XP & Level (Cosmetic Only)

Stats are fixed at creation. XP is purely cosmetic and creates attachment without enabling pay-to-win.

```
Level 1:   0 XP    (default)
Level 2:   50 XP   (sparkle badge on cat card)
Level 3:   150 XP  (gold border on cat card)
Level 4:   300 XP  (animated shimmer on cat card)
Level 5:   500 XP  (legendary glow + "Veteran" title on cat card)
```

A Level 5 veteran cat you have battled 50 times is psychologically costly to lose. This makes battles feel more meaningful without affecting balance.

## 12.2 Player Level

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

## 12.3 Daily Login Bonus

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

## 12.4 Achievements

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

# 13. PvP System

## 13.1 Matchmaking

### Matchmaking Cascade

Matchmaking follows a strict cascade: try real players first, widen the search twice, then fall back to a bot. The player should always find a battle within 2–3 seconds. They should never see a "no opponents found" screen.

```javascript
async function findOpponent(userId, userCatId) {
  const user    = await User.findById(userId)
  const userCat = await Cat.findById(userCatId)
  const catScore = userCat.power + userCat.toughness + userCat.speed

  // Tier 1: Tight match (±100 ELO, ±3 cat score, active in 7 days)
  const tier1 = await findRealOpponent(userId, user.elo_rating, catScore, {
    eloRange: 100, scoreRange: 3, activeDays: 7, limit: 20
  })
  if (tier1) return { ...tier1, match_quality: 'tight', is_bot: false }

  // Tier 2: Widened match (±200 ELO, ±5 cat score, active in 14 days)
  const tier2 = await findRealOpponent(userId, user.elo_rating, catScore, {
    eloRange: 200, scoreRange: 5, activeDays: 14, limit: 20
  })
  if (tier2) return { ...tier2, match_quality: 'wide', is_bot: false }

  // Tier 3: Any real player (±400 ELO, no cat score filter, active in 30 days)
  const tier3 = await findRealOpponent(userId, user.elo_rating, catScore, {
    eloRange: 400, scoreRange: 30, activeDays: 30, limit: 20
  })
  if (tier3) return { ...tier3, match_quality: 'any_real', is_bot: false }

  // Tier 4: Bot fallback — always available, always fair
  const bot = await generateBotOpponent(user, userCat, catScore)
  return { ...bot, match_quality: 'bot', is_bot: true }
}

async function findRealOpponent(userId, elo, catScore, opts) {
  const candidates = await User.findAll({
    where: {
      user_id:     { $ne: userId },
      is_bot:      false,
      elo_rating:  { $between: [elo - opts.eloRange, elo + opts.eloRange] },
      last_active: { $gt: new Date(Date.now() - opts.activeDays * 24 * 60 * 60 * 1000) }
    },
    order: db.raw('RANDOM()'),
    limit: opts.limit
  })

  for (const candidate of candidates) {
    const candidateCat   = await getActiveCat(candidate.user_id)
    const candidateScore = candidateCat.power + candidateCat.toughness + candidateCat.speed
    if (Math.abs(candidateScore - catScore) <= opts.scoreRange) {
      return { opponent: candidate, opponentCat: candidateCat }
    }
  }
  return null
}
```

### Matchmaking Cooldown

A player cannot battle the same real opponent more than **twice per hour**. This prevents targeted farming of a specific player. Bots are exempt (they're generated fresh each time).

```javascript
async function checkMatchCooldown(userId, opponentId) {
  const recentBattles = await Battle.count({
    where: {
      player1_id: userId,
      player2_id: opponentId,
      created_at: { $gt: new Date(Date.now() - 60 * 60 * 1000) }
    }
  })
  return recentBattles < 2
}
```

---

## 13.2 Bot System (Player Liquidity)

Bots ensure every player always has someone to fight — during soft launch with a small player pool, off-peak hours, or at extreme ELO tiers with few real opponents. Bots must feel like real opponents and must not be farmable for power.

### Bot Design Principles

1. **Invisible.** Players should not know they're fighting a bot. Bot usernames come from the same pool as real player names. No "[BOT]" tag, no visual difference.
2. **Fair.** Bot cat stats are calibrated to the player's cat — not trivially easy, not impossibly hard. Target: player wins ~55–60% of bot battles (feels winnable but not free).
3. **Not farmable.** Bot battles give reduced rewards and never transfer a real cat to the player. The player gets XP and reduced Pawcoin but not a cat they can breed or use in PvP.
4. **Throttled.** Maximum 5 bot battles per player per day. After that, "No opponents available — try again later." This prevents a player from grinding bots endlessly.
5. **Tracked separately.** Bot battles are logged with `is_bot: true` so analytics can distinguish real PvP from bot PvP. Bot wins do not count toward the weekly leaderboard.

### Bot Cat Generation

```javascript
async function generateBotOpponent(user, userCat, catScore) {
  const botProfile = generateBotProfile(user.elo_rating)

  const botCat = generateBotCat(userCat, catScore)

  return { opponent: botProfile, opponentCat: botCat }
}

function generateBotProfile(playerElo) {
  return {
    user_id:      `bot_${crypto.randomUUID()}`,
    username:     BOT_NAMES[randomInt(0, BOT_NAMES.length - 1)],
    display_name: BOT_DISPLAY_NAMES[randomInt(0, BOT_DISPLAY_NAMES.length - 1)],
    elo_rating:   playerElo + randomInt(-50, 50),
    is_bot:       true   // stored in battle log, never exposed to client
  }
}

function generateBotCat(playerCat, catScore) {
  // Bot cat stat total = player cat stat total ± 2
  // This ensures the match feels competitive, not a stomp
  const targetScore = catScore + randomInt(-2, 2)

  // Distribute stats randomly within range, clamped to rarity bounds
  const rarity = playerCat.rarity  // Match rarity so visuals feel fair
  const ranges = {
    common: [1, 3], rare: [3, 6], epic: [5, 8], legendary: [7, 10]
  }
  const [min, max] = ranges[rarity]

  let power, toughness, speed
  do {
    power     = CLAMP(randomInt(min, max), 1, 10)
    toughness = CLAMP(randomInt(min, max), 1, 10)
    speed     = CLAMP(randomInt(min, max), 1, 10)
  } while (Math.abs((power + toughness + speed) - targetScore) > 2)

  // Pull visual from catalog so the cat looks real
  const catalogCat = await CatalogCat.findRandom({ rarity })

  return {
    cat_id:         `bot_cat_${crypto.randomUUID()}`,
    name:           catalogCat.name,
    base_image_url: catalogCat.image_url,
    rarity,
    power,
    toughness,
    speed,
    xp:             randomInt(0, 200),
    cat_level:      randomInt(1, 3),
    is_bot_cat:     true  // never exposed to client
  }
}
```

### Bot Name Pool

Pre-populated with 200+ kawaii-themed usernames so bots look indistinguishable from real players. Examples:

```javascript
const BOT_NAMES = [
  'MochiPaws', 'StarKitty', 'LunaWhisker', 'PeachFuzz',
  'BubbleMew', 'DaisyCat', 'SakuraNeko', 'CloudPurr',
  'HoneyDrop', 'PixelKitten', 'CocoBean', 'MintPaw',
  'RosyNose', 'TofuChan', 'WaffleKat', 'SunnyMeow',
  // ... 200+ total, generated in bulk, stored in config
]
```

### Bot Battle Rewards (Reduced)

```javascript
const REWARDS = {
  real_pvp: {
    winner_xp:       10,
    winner_pawcoin:  5,
    cat_transfer:    true,    // winner takes loser's cat
    elo_update:      true,
    leaderboard:     true
  },
  bot_battle: {
    winner_xp:       5,       // 50% of real PvP
    winner_pawcoin:  2,       // 40% of real PvP
    cat_transfer:    false,   // NO cat transfer — bot cat vanishes
    elo_update:      false,   // no ELO change from bot battles
    leaderboard:     false    // bot wins don't count for rankings
  }
}
```

**Why no cat transfer from bots:** If bot battles gave cats, players could farm infinite cats from bots, breed upward, and bypass the entire gacha/PvP economy. The bot cat is ephemeral — it exists only for the duration of the battle and is never persisted to the database.

**Why reduced Pawcoin:** At 2 Pawcoin per bot win × 5 daily limit = 10 Pawcoin/day maximum from bots. This is marginal compared to the 100+ Pawcoin/day from login bonuses, real PvP, and achievements. Bots keep players engaged but never replace real PvP as the primary progression path.

### Bot Battle Daily Limit

```javascript
async function checkBotBattleLimit(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const botBattlesToday = await Battle.count({
    where: {
      player1_id: userId,
      is_bot_battle: true,
      created_at: { $gt: today }
    }
  })

  return botBattlesToday < 5  // Max 5 bot battles per day
}
```

### Bot Battle Logging

Bot battles are logged in the same `battles` table with `is_bot_battle: true` for analytics. The bot's fake user_id and cat_id are stored but flagged.

```javascript
async function logBotBattle(userId, userCat, botCat, winner, rounds, battleLog) {
  return await Battle.create({
    player1_id:     userId,
    player2_id:     null,            // no real opponent
    player1_cat_id: userCat.cat_id,
    player2_cat_id: null,            // bot cat not persisted
    winner_id:      winner === userCat ? userId : null,
    loser_id:       winner === userCat ? null : userId,
    winning_cat_id: winner.cat_id || null,
    losing_cat_id:  null,
    rounds_played:  rounds,
    battle_log:     { ...battleLog, bot_profile: botCat },
    is_pvp:         false,
    is_bot_battle:  true,
    resolution_type: 'normal'
  })
}
```

### New Player Protection

For the first 24 hours after registration (or until the player wins 3 battles, whichever comes first), matchmaking skews toward bot opponents even if real opponents exist. This guarantees the new player's first few battles are winnable (bot win rate tuned to ~65% for new players). After the protection period, normal matchmaking cascade resumes.

```javascript
async function isNewPlayerProtected(user) {
  const hoursSinceCreation = (Date.now() - user.created_at) / (1000 * 60 * 60)
  return hoursSinceCreation < 24 && user.battle_wins < 3
}

async function findOpponentWithProtection(userId, userCatId) {
  const user = await User.findById(userId)

  if (await isNewPlayerProtected(user)) {
    // 80% chance of bot during protection period
    if (Math.random() < 0.80) {
      const userCat  = await Cat.findById(userCatId)
      const catScore = userCat.power + userCat.toughness + userCat.speed
      const bot = await generateBotOpponent(user, userCat, catScore)
      return { ...bot, match_quality: 'new_player_bot', is_bot: true }
    }
  }

  return findOpponent(userId, userCatId)  // Normal cascade
}
```

### Losing Streak Protection

If a player loses **3 consecutive real PvP battles**, the next matchmaking attempt forces a bot opponent with stats slightly below the player's cat (target: ~70% player win rate). This prevents tilt-quitting. Resets after any win.

```javascript
async function checkLosingStreak(userId) {
  const recentBattles = await Battle.findAll({
    where: { player1_id: userId, is_bot_battle: false },
    order: [['created_at', 'DESC']],
    limit: 3
  })
  return recentBattles.length === 3 && recentBattles.every(b => b.winner_id !== userId)
}
```

---

## 13.3 ELO Update

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

## 13.3 Weekly Leaderboard Rewards

```
1st Place:   1 Legendary pull + 500 Pawcoin
2nd Place:   1 Epic pull + 300 Pawcoin
3rd Place:   1 Rare pull + 150 Pawcoin
Top 10:      100 Pawcoin
Top 100:     50 Pawcoin
```

Seasonal reset every Monday 00:00 UTC.
