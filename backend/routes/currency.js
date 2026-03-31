import { Router } from 'express';
import { requireAuth, guardAuth } from '../middleware/auth.js';
import { pool, withTransaction } from '../db.js';

const router = Router();

const DAILY_REWARDS = [
  { type: 'currency', amount: 50 },
  { type: 'currency', amount: 75 },
  { type: 'common_pull', amount: 1 },
  { type: 'currency', amount: 100 },
  { type: 'rare_pull', amount: 1 },
  { type: 'currency', amount: 150 },
  { type: 'epic_pull', amount: 1 },
];

router.post('/currency/daily-bonus', requireAuth, guardAuth, async (req, res) => {
  try {
    const result = await withTransaction(async (client) => {
      const userRes = await client.query(
        'SELECT user_id, login_streak, last_login_date, virtual_currency FROM users WHERE user_id = $1 FOR UPDATE',
        [req.userId]
      );
      if (userRes.rows.length === 0) throw new Error('USER_NOT_FOUND');
      const user = userRes.rows[0];
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = user.last_login_date ? new Date(user.last_login_date).toISOString().slice(0, 10) : null;
      let streak = user.login_streak || 0;

      if (lastDate === today) {
        return { claimed: true, streak, reward: null, message: 'Already claimed today' };
      }
      if (lastDate) {
        const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        if (lastDate !== yesterday) streak = 0;
      }
      streak = (streak % 7) + 1;
      const reward = DAILY_REWARDS[streak - 1];

      if (reward.type === 'currency') {
        await client.query(
          'UPDATE users SET virtual_currency = virtual_currency + $1, login_streak = $2, last_login_date = $3 WHERE user_id = $4',
          [reward.amount, streak, today, req.userId]
        );
        return { claimed: false, streak, reward: { type: 'currency', amount: reward.amount } };
      }

      await client.query(
        'UPDATE users SET login_streak = $1, last_login_date = $2 WHERE user_id = $3',
        [streak, today, req.userId]
      );
      if (reward.type === 'common_pull' || reward.type === 'rare_pull' || reward.type === 'epic_pull') {
        const rarity = reward.type.replace('_pull', '');
        const catalogRes = await client.query(
          'SELECT * FROM catalog_cats WHERE rarity = $1 AND is_available = true ORDER BY RANDOM() LIMIT 1',
          [rarity]
        );
        const catalog = catalogRes.rows[0];
        if (catalog) {
          const { generateStatsForRarity } = await import('../services/lootboxService.js');
          const stats = generateStatsForRarity(rarity);
          await client.query(
            `INSERT INTO cats (owner_id, name, base_image_url, variety_tokens, rarity, variety, power, toughness, speed, generation, acquired_via)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 'loot_box')`,
            [
              req.userId,
              catalog.name,
              catalog.image_url,
              JSON.stringify(catalog.variety_tokens || {}),
              rarity,
              catalog.variety || 'whisker',
              stats.power,
              stats.toughness,
              stats.speed,
            ]
          );
        }
        return { claimed: false, streak, reward: { type: reward.type, rarity } };
      }
      return { claimed: false, streak, reward };
    });
    res.json(result);
  } catch (e) {
    if (e.message === 'USER_NOT_FOUND') return res.status(404).json({ error: 'USER_NOT_FOUND' });
    throw e;
  }
});

export default router;
