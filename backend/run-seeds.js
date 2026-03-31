/**
 * Run database seeds (e.g. one catalog_cat for dev).
 * Requires DATABASE_URL in .env.
 */
import 'dotenv/config';
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedsDir = join(__dirname, '..', 'database', 'seeds');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL in .env');
  process.exit(1);
}

const client = new pg.Client({ connectionString });

const seedFiles = readdirSync(seedsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort();

async function run() {
  await client.connect();
  for (const file of seedFiles) {
    const sql = readFileSync(join(seedsDir, file), 'utf8');
    await client.query(sql);
    console.log('Ran seed:', file);
  }
  await client.end();
  console.log('Seeds done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
