/**
 * Raw Postgres pool for transactional operations (lootbox, battle, breed).
 * Uses DATABASE_URL from .env.
 */
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('DATABASE_URL not set; transactional routes (lootbox, battle, breed) will fail.');
}

export const pool = connectionString ? new pg.Pool({ connectionString }) : null;

export async function withTransaction(fn) {
  if (!pool) throw new Error('DATABASE_URL required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
