import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, guardAuth } from '../middleware/auth.js';

const router = Router();

router.get('/accessories', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM accessories WHERE is_available = true ORDER BY slot');
  res.json(r.rows || []);
});

router.get('/accessories/inventory/:user_id', requireAuth, guardAuth, async (req, res) => {
  if (req.params.user_id !== req.userId) return res.status(403).json({ error: 'FORBIDDEN' });
  const r = await pool.query(
    `SELECT ua.accessory_id, ua.quantity, a.* FROM user_accessories ua
     JOIN accessories a ON a.accessory_id = ua.accessory_id WHERE ua.user_id = $1`,
    [req.userId]
  );
  res.json(r.rows || []);
});

export default router;
