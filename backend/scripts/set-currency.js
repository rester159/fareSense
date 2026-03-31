/**
 * One-off script: Set virtual_currency for a user by username.
 * Run from backend: node scripts/set-currency.js [username] [amount]
 *   Ensure .env has DATABASE_URL (Neon connection string) and JWT_SECRET.
 * Example: node scripts/set-currency.js rester159 1000000
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../.env') });

const username = process.argv[2] || 'rester159';
const amount = parseInt(process.argv[3] || '1000000', 10);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL in .env (Neon connection string)');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function main() {
  const safeUsername = username.toLowerCase().replace(/\s+/g, '_');
  const findRes = await pool.query(
    'SELECT user_id, username, virtual_currency FROM users WHERE username = $1',
    [safeUsername]
  );
  if (findRes.rows.length === 0) {
    console.error(`User "${username}" not found.`);
    process.exit(1);
  }
  const user = findRes.rows[0];
  await pool.query('UPDATE users SET virtual_currency = $1 WHERE user_id = $2', [amount, user.user_id]);
  console.log(`Set ${user.username} virtual_currency: ${user.virtual_currency} → ${amount}`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
