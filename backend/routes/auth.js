import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../db.js';
import { signToken, verifyToken } from '../lib/jwt.js';

const router = Router();
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Body: { email, password, username }
 * Creates user in users table with bcrypt-hashed password. Returns JWT.
 */
router.post('/auth/register', async (req, res) => {
  console.log('[auth] POST /auth/register received');
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'email, password, and username required' });
    }
    if (username.length < 2 || username.length > 32) {
      return res.status(400).json({ error: 'INVALID_USERNAME', message: 'username must be 2–32 characters' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = crypto.randomUUID();
    const safeUsername = username.toLowerCase().replace(/\s+/g, '_').slice(0, 32);

    await pool.query(
      `INSERT INTO users (user_id, email, password_hash, username, display_name, virtual_currency, roster_capacity, elo_rating, is_bot)
       VALUES ($1, $2, $3, $4, $5, 500, 30, 1000, false)`,
      [userId, email.toLowerCase().trim(), passwordHash, safeUsername, username]
    );

    const token = signToken({ sub: userId });
    res.status(201).json({
      user_id: userId,
      email,
      username: safeUsername,
      access_token: token,
      refresh_token: token,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    });
  } catch (e) {
    if (e.code === '23505') {
      if (e.constraint?.includes('email')) return res.status(409).json({ error: 'EMAIL_EXISTS' });
      return res.status(409).json({ error: 'USERNAME_TAKEN', message: 'Username already taken' });
    }
    console.error('[auth] register error:', e);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: e.message });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns JWT.
 */
router.post('/auth/login', async (req, res) => {
  console.log('[auth] POST /auth/login received');
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const userRes = await pool.query(
      'SELECT user_id, email, username, password_hash FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Account uses different auth' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    await pool.query(
      'UPDATE users SET last_active = $1 WHERE user_id = $2',
      [new Date().toISOString(), user.user_id]
    );

    const token = signToken({ sub: user.user_id });
    res.json({
      user_id: user.user_id,
      email: user.email,
      access_token: token,
      refresh_token: token,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    });
  } catch (e) {
    console.error('[auth] login error:', e);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: e.message });
  }
});

/**
 * GET /api/auth/refresh
 * Header: Authorization: Bearer <token>
 * Returns new JWT (same payload, new expiry).
 */
router.get('/auth/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.refresh_token;
    if (!token) return res.status(400).json({ error: 'MISSING_REFRESH_TOKEN' });

    const payload = verifyToken(token);
    if (!payload?.sub) return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });

    const newToken = signToken({ sub: payload.sub });
    res.json({
      access_token: newToken,
      refresh_token: newToken,
      expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    });
  } catch (e) {
    res.status(500).json({ error: 'INTERNAL_ERROR', message: e.message });
  }
});

export default router;
