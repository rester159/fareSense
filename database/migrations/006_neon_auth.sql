-- Migration for Neon: add email + password_hash for custom auth (replacing Supabase Auth)
-- Run against fresh Neon database or after 001-005.

-- Add auth columns to users (nullable for existing rows; new users will have them)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

COMMENT ON COLUMN users.email IS 'Login email; used with Neon custom auth';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hash of password';
