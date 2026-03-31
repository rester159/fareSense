# 16. Edge Cases & Error Handling

## 16.1 Battle Edge Cases

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

## 16.1b Bot Battle Edge Cases

**Bot daily limit reached:** If player has used all 5 bot battles today and no real opponents exist, show "No opponents available right now — try again later!" with a countdown to next daily reset. Never show an empty state without explanation.

**Bot battle disconnect:** Bot battles are computed entirely server-side (no real opponent to wait for). If the client disconnects mid-animation, the result is already determined. On reconnect, serve the cached result and resume from the result card.

**Bot cat appears in roster/lineage:** Bot cats are ephemeral and never written to the `cats` table. They exist only in the `battle_log` JSONB. No code path should attempt to query a bot cat by ID from the `cats` table.

**Bot rewards during events/promotions:** If a seasonal event multiplies battle rewards (e.g. "2× Pawcoin weekend"), bot battle rewards are also multiplied — but from their reduced base (2 × 2 = 4 Pawcoin, not 2 × 5 = 10). Events should never make bot farming competitive with real PvP.

**Losing streak + bot limit collision:** If a player is on a 3-game losing streak (triggering streak protection) but has also used all 5 daily bot battles, the next match uses the normal matchmaking cascade against real players. Streak protection cannot override the daily bot cap.

---

## 16.2 Breeding Edge Cases

Same cat selected twice: throw `CANNOT_BREED_WITH_SELF`. UI: "A cat can't breed with itself!"

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

## 16.3 Network & Offline Handling

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
