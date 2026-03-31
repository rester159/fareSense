import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import catsRoutes from './routes/cats.js';
import lootboxRoutes from './routes/lootbox.js';
import battlesRoutes from './routes/battles.js';
import breedRoutes from './routes/breed.js';
import accessoriesRoutes from './routes/accessories.js';
import currencyRoutes from './routes/currency.js';
import leaderboardRoutes from './routes/leaderboard.js';
import devRoutes from './routes/dev.js';

const app = express();
const PORT = process.env.PORT || 3001;

const dbUrl = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
if (!dbUrl || !jwtSecret) {
  console.error('Missing DATABASE_URL or JWT_SECRET in .env (use Neon connection string for DATABASE_URL)');
  process.exit(1);
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.use('/api/auth/register', rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'TOO_MANY_REGISTRATIONS' }
}));

app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', catsRoutes);
app.use('/api', lootboxRoutes);
app.use('/api', battlesRoutes);
app.use('/api', breedRoutes);
app.use('/api', accessoriesRoutes);
app.use('/api', currencyRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', devRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'doki-backend' });
});

// Serve web app at / (path to the experience). In Docker, index.js is in /app so webDir = /frontend/dist
const webDir = path.join(path.dirname(__dirname), 'frontend', 'dist');
const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };
if (fs.existsSync(webDir)) {
  app.use(express.static(webDir, { index: false, setHeaders: (res) => res.set(noCacheHeaders) }));
  app.get('*', (req, res) => {
    res.set(noCacheHeaders);
    res.sendFile(path.join(webDir, 'index.html'));
  });
} else {
  const noWebMessage = (req, res) => res.json({
    service: 'doki-backend',
    message: 'DOKI API — build web app (cd frontend && npm run build:web), then restart. Game at /, API: /api/*, health: /health'
  });
  app.get('/', noWebMessage);
  app.get('*', noWebMessage); // avoid "Cannot GET /app" etc.
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'INTERNAL_ERROR' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DOKI backend listening on http://0.0.0.0:${PORT}`);
});
