# 14. Monetization Strategy

## 14.1 Virtual Currency Economy ("Pawcoin")

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

## 14.2 Real Money Purchase Tiers

```
Starter Pack:    $0.99   →  150 Pawcoin + 1 guaranteed Rare cat
Value Pack:      $4.99   →  900 Pawcoin + 1 guaranteed Epic cat
Mega Pack:       $9.99   →  2,200 Pawcoin + 1 guaranteed Epic + 1 random accessory
Ultra Pack:      $19.99  →  5,000 Pawcoin + 1 guaranteed Legendary + 3 accessories
Monthly Pass:    $4.99/mo → 100 Pawcoin/day + double login bonus + 1 exclusive monthly cat
```

**First Purchase Bonus**: First real-money purchase of any tier gets +50% Pawcoin bonus. One-time only. "Offer expires in 48 hours" timer (genuine).

---

# 15. Analytics & Instrumentation

## 15.1 Core Events

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

## 15.2 Key Metrics

**Daily Health**: DAU, DAU/MAU ratio (target >40%), average session length (target 45–90 sec), sessions per user per day (target 3–5), D1/D7/D30 retention (targets: 40%/20%/10%).

**Economy**: Daily Pawcoin earned vs spent, pull rate per DAU (target >1), breed rate per DAU (target >0.5), battle rate per DAU (target >3).

**Monetization**: ARPU, ARPPU, conversion rate (target 3–5%), revenue by pack tier, LTV by cohort.

**Funnel**: Registration → First Pull → First Battle → First Breed → First Purchase. Track drop-off at each step.
