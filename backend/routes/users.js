import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, guardAuth } from '../middleware/auth.js';

const router = Router();

/** GET /api/me — current user profile (auth required) */
router.get('/me', requireAuth, guardAuth, async (req, res) => {
  const r = await pool.query(
    `SELECT user_id, username, display_name, avatar_url, virtual_currency, roster_capacity, battle_wins, battle_losses, player_level, elo_rating, pity_counter_epic, pity_counter_legendary FROM users WHERE user_id = $1`,
    [req.userId]
  );
  if (r.rows.length === 0) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json(r.rows[0]);
});

/** GET /api/users/:user_id — profile (public-ish) */
router.get('/users/:user_id', requireAuth, async (req, res) => {
  const { user_id } = req.params;
  const r = await pool.query(
    `SELECT user_id, username, display_name, avatar_url, virtual_currency, roster_capacity, battle_wins, battle_losses, player_level, elo_rating FROM users WHERE user_id = $1`,
    [user_id]
  );
  if (r.rows.length === 0) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json(r.rows[0]);
});

/** GET /api/users/:user_id/achievements */
router.get('/users/:user_id/achievements', requireAuth, async (req, res) => {
  const { user_id } = req.params;
  const r = await pool.query(
    'SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1',
    [user_id]
  );
  res.json(r.rows || []);
});

/** GET /api/users/:user_id/roster — cats owned by user */
router.get('/users/:user_id/roster', requireAuth, guardAuth, async (req, res) => {
  const { user_id } = req.params;
  if (req.userId !== user_id) return res.status(403).json({ error: 'FORBIDDEN' });
  const r = await pool.query('SELECT * FROM cats WHERE owner_id = $1 ORDER BY created_at DESC', [user_id]);
  res.json(r.rows || []);
});

export default router;
