import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, guardAuth } from '../middleware/auth.js';

const router = Router();

/** POST /api/dev/give-cat — give current user one cat (development only) */
router.post('/dev/give-cat', requireAuth, guardAuth, async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).json({ error: 'NOT_FOUND' });
  const userId = req.userId;

  const catalogRes = await pool.query(
    'SELECT catalog_id, name, image_url, rarity, variety, variety_tokens FROM catalog_cats WHERE is_available = true LIMIT 1'
  );
  if (catalogRes.rows.length === 0) {
    return res.status(400).json({
      error: 'NO_CATALOG',
      message: 'Run seed: insert at least one row into catalog_cats (see database/seeds)',
    });
  }

  const catalog = catalogRes.rows[0];
  const stats = { power: 3, toughness: 3, speed: 3 };
  const catRes = await pool.query(
    `INSERT INTO cats (owner_id, name, base_image_url, variety_tokens, rarity, variety, power, toughness, speed, generation, acquired_via)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 'loot_box') RETURNING *`,
    [
      userId,
      catalog.name,
      catalog.image_url,
      JSON.stringify(catalog.variety_tokens || {}),
      catalog.rarity,
      catalog.variety || 'whisker',
      stats.power,
      stats.toughness,
      stats.speed,
    ]
  );
  res.status(201).json(catRes.rows[0]);
});

export default router;
