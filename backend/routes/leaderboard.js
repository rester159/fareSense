import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard/global', requireAuth, async (req, res) => {
  const r = await pool.query(
    `SELECT user_id, username, display_name, elo_rating, battle_wins FROM users WHERE is_bot = false ORDER BY elo_rating DESC LIMIT 100`
  );
  res.json(r.rows || []);
});

router.get('/leaderboard/weekly', requireAuth, async (req, res) => {
  const r = await pool.query(
    `SELECT user_id, username, display_name, battle_wins, elo_rating FROM users WHERE is_bot = false ORDER BY battle_wins DESC LIMIT 100`
  );
  res.json(r.rows || []);
});

export default router;
