import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, guardAuth } from '../middleware/auth.js';
import { executePull } from '../services/lootboxService.js';

const router = Router();

router.use(
  '/lootbox/pull',
  rateLimit({ windowMs: 60 * 1000, max: 5, message: { error: 'TOO_MANY_PULLS' } })
);

router.post('/lootbox/pull', requireAuth, guardAuth, async (req, res) => {
  try {
    const pullType = req.body?.pull_type === '10x' ? '10x' : 'single';
    const cats = await executePull(req.userId, pullType);
    res.status(201).json({ cats });
  } catch (e) {
    if (e.message === 'INSUFFICIENT_CURRENCY') {
      return res.status(400).json({ error: 'INSUFFICIENT_CURRENCY' });
    }
    if (e.message === 'NO_CATALOG_CAT') {
      return res.status(503).json({ error: 'NO_CATALOG_CAT' });
    }
    throw e;
  }
});

export default router;
