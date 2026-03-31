import { verifyToken } from '../lib/jwt.js';

/**
 * Require valid JWT. Sets req.userId (UUID) and req.authError (if any).
 */
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    req.authError = 'MISSING_TOKEN';
    return next();
  }
  const payload = verifyToken(token);
  if (!payload?.sub) {
    req.authError = 'INVALID_TOKEN';
    return next();
  }
  req.userId = payload.sub;
  next();
}

/** Require auth; send 401 if not authenticated. */
export function guardAuth(req, res, next) {
  if (req.authError || !req.userId) {
    return res.status(401).json({ error: req.authError || 'UNAUTHORIZED' });
  }
  next();
}
