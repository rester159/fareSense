import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, guardAuth } from '../middleware/auth.js';
import { initiateBattle, completeBattle } from '../services/battleService.js';
import { pool } from '../db.js';

const router = Router();

router.use(
  '/battles/initiate',
  rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'TOO_MANY_BATTLES' } })
);

router.post('/battles/initiate', requireAuth, guardAuth, async (req, res) => {
  try {
    const { cat_id } = req.body;
    if (!cat_id) return res.status(400).json({ error: 'MISSING_CAT_ID' });
    const result = await initiateBattle(req.userId, cat_id);
    res.status(201).json(result);
  } catch (e) {
    if (e.message === 'CAT_NOT_FOUND_OR_IN_BATTLE') return res.status(400).json({ error: 'CAT_NOT_FOUND_OR_IN_BATTLE' });
    if (e.message === 'NO_OPPONENT') return res.status(503).json({ error: 'NO_OPPONENT' });
    throw e;
  }
});

router.post('/battles/:battle_id/complete', requireAuth, guardAuth, async (req, res) => {
  try {
    const { battle_id } = req.params;
    const result = await completeBattle(battle_id, req.userId);
    res.json(result);
  } catch (e) {
    if (e.message === 'BATTLE_NOT_FOUND') return res.status(404).json({ error: 'BATTLE_NOT_FOUND' });
    throw e;
  }
});

router.get('/battles/:battle_id', requireAuth, guardAuth, async (req, res) => {
  const { battle_id } = req.params;
  const r = await pool.query(
    'SELECT * FROM battles WHERE battle_id = $1 AND player1_id = $2',
    [battle_id, req.userId]
  );
  if (r.rows.length === 0) return res.status(404).json({ error: 'BATTLE_NOT_FOUND' });
  res.json(r.rows[0]);
});

export default router;
