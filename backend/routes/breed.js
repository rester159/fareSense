import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, guardAuth } from '../middleware/auth.js';
import { initiateBreed } from '../services/breedService.js';

const router = Router();

router.use(
  '/breed/initiate',
  rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'TOO_MANY_BREEDS' } })
);

router.post('/breed/initiate', requireAuth, guardAuth, async (req, res) => {
  try {
    const { parent1_id, parent2_id } = req.body;
    if (!parent1_id || !parent2_id) {
      return res.status(400).json({ error: 'MISSING_PARENT_IDS' });
    }
    const { cat, isNew } = await initiateBreed(req.userId, parent1_id, parent2_id);
    res.status(201).json({ cat, isNew });
  } catch (e) {
    if (e.message === 'CANNOT_BREED_WITH_SELF') {
      return res.status(400).json({ error: 'CANNOT_BREED_WITH_SELF' });
    }
    if (e.message === 'PARENT_NOT_OWNED' || e.message === 'CAT1_IN_COOLDOWN' || e.message === 'CAT2_IN_COOLDOWN') {
      return res.status(400).json({ error: e.message });
    }
    if (e.message === 'INSUFFICIENT_CURRENCY') {
      return res.status(400).json({ error: 'INSUFFICIENT_CURRENCY' });
    }
    throw e;
  }
});

export default router;
