/**
 * Run database migrations in order.
 * Requires DATABASE_URL in .env (Neon connection string from neon.tech → Project → Connection string).
 */
import 'dotenv/config';
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'database', 'migrations');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL in .env (Neon connection string from neon.tech)');
  process.exit(1);
}

const client = new pg.Client({ connectionString });

const migrationFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

async function run() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const file of migrationFiles) {
    const name = file;
    const { rows } = await client.query('SELECT 1 FROM _migrations WHERE name = $1', [name]);
    if (rows.length > 0) {
      console.log('Skip (already applied):', name);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
    console.log('Applied:', name);
  }

  await client.end();
  console.log('Migrations done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

