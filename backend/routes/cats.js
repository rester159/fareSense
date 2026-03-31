import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth, guardAuth } from '../middleware/auth.js';

const router = Router();

/** GET /api/cats/:cat_id — single cat; 403 if not owner */
router.get('/cats/:cat_id', requireAuth, guardAuth, async (req, res) => {
  const { cat_id } = req.params;
  const catRes = await pool.query('SELECT * FROM cats WHERE cat_id = $1', [cat_id]);
  if (catRes.rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND' });
  const cat = catRes.rows[0];
  if (cat.owner_id !== req.userId) return res.status(403).json({ error: 'FORBIDDEN' });

  const slotsRes = await pool.query(
    `SELECT ca.slot, a.image_url, a.attachment_x_percent, a.attachment_y_percent, a.scale_factor, a.z_index, a.rotation_degrees
     FROM cat_accessories ca JOIN accessories a ON a.accessory_id = ca.accessory_id WHERE ca.cat_id = $1`,
    [cat_id]
  );
  const accessory_slots = slotsRes.rows.map((r) => ({
    slot: r.slot,
    accessories: {
      image_url: r.image_url,
      attachment_x_percent: r.attachment_x_percent,
      attachment_y_percent: r.attachment_y_percent,
      scale_factor: r.scale_factor,
      z_index: r.z_index,
      rotation_degrees: r.rotation_degrees,
    },
  }));
  res.json({ ...cat, accessory_slots });
});

/** PATCH /api/cats/:cat_id/accessory — equip (body: { slot, accessory_id }) */
router.patch('/cats/:cat_id/accessory', requireAuth, guardAuth, async (req, res) => {
  const { cat_id } = req.params;
  const { slot, accessory_id } = req.body;
  if (!slot || !accessory_id) return res.status(400).json({ error: 'MISSING_SLOT_OR_ACCESSORY_ID' });
  const validSlots = ['head', 'body', 'waist', 'back', 'paw'];
  if (!validSlots.includes(slot)) return res.status(400).json({ error: 'INVALID_SLOT' });

  const catRes = await pool.query('SELECT owner_id FROM cats WHERE cat_id = $1', [cat_id]);
  if (catRes.rows.length === 0 || catRes.rows[0].owner_id !== req.userId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }

  await pool.query(
    `INSERT INTO cat_accessories (cat_id, slot, accessory_id) VALUES ($1, $2, $3)
     ON CONFLICT (cat_id, slot) DO UPDATE SET accessory_id = $3`,
    [cat_id, slot, accessory_id]
  );

  const updatedRes = await pool.query('SELECT * FROM cats WHERE cat_id = $1', [cat_id]);
  const slotsRes = await pool.query(
    `SELECT ca.slot, a.image_url, a.attachment_x_percent, a.attachment_y_percent, a.scale_factor, a.z_index, a.rotation_degrees
     FROM cat_accessories ca JOIN accessories a ON a.accessory_id = ca.accessory_id WHERE ca.cat_id = $1`,
    [cat_id]
  );
  const accessory_slots = slotsRes.rows.map((r) => ({
    slot: r.slot,
    accessories: {
      image_url: r.image_url,
      attachment_x_percent: r.attachment_x_percent,
      attachment_y_percent: r.attachment_y_percent,
      scale_factor: r.scale_factor,
      z_index: r.z_index,
      rotation_degrees: r.rotation_degrees,
    },
  }));
  res.json({ ...updatedRes.rows[0], accessory_slots });
});

/** DELETE /api/cats/:cat_id/accessory/:slot — unequip */
router.delete('/cats/:cat_id/accessory/:slot', requireAuth, guardAuth, async (req, res) => {
  const { cat_id, slot } = req.params;
  const validSlots = ['head', 'body', 'waist', 'back', 'paw'];
  if (!validSlots.includes(slot)) return res.status(400).json({ error: 'INVALID_SLOT' });

  const catRes = await pool.query('SELECT owner_id FROM cats WHERE cat_id = $1', [cat_id]);
  if (catRes.rows.length === 0 || catRes.rows[0].owner_id !== req.userId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }

  await pool.query('DELETE FROM cat_accessories WHERE cat_id = $1 AND slot = $2', [cat_id, slot]);

  const updatedRes = await pool.query('SELECT * FROM cats WHERE cat_id = $1', [cat_id]);
  const slotsRes = await pool.query(
    `SELECT ca.slot, a.image_url, a.attachment_x_percent, a.attachment_y_percent, a.scale_factor, a.z_index, a.rotation_degrees
     FROM cat_accessories ca JOIN accessories a ON a.accessory_id = ca.accessory_id WHERE ca.cat_id = $1`,
    [cat_id]
  );
  const accessory_slots = slotsRes.rows.map((r) => ({
    slot: r.slot,
    accessories: {
      image_url: r.image_url,
      attachment_x_percent: r.attachment_x_percent,
      attachment_y_percent: r.attachment_y_percent,
      scale_factor: r.scale_factor,
      z_index: r.z_index,
      rotation_degrees: r.rotation_degrees,
    },
  }));
  res.json({ ...updatedRes.rows[0], accessory_slots });
});

export default router;
