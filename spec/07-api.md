# 11. API Architecture

## 11.1 All Endpoints

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

## 11.2 Rate Limiting

```javascript
const rateLimits = {
  '/api/battles/initiate':  { windowMs: 60000, max: 20 },   // 20 battles/min
  '/api/breed/initiate':    { windowMs: 60000, max: 10 },   // 10 breeds/min
  '/api/lootbox/pull':      { windowMs: 60000, max: 5  },   // 5 pulls/min
  '/api/auth/register':     { windowMs: 60000, max: 3  },   // 3 registrations/min per IP
}
```

## 11.3 Currency Atomicity (Critical)

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
