-- DOKI schema: extensions + users
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  user_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username                 VARCHAR(32) UNIQUE NOT NULL,
  display_name             VARCHAR(64),
  avatar_url               TEXT,
  virtual_currency         INTEGER DEFAULT 500,
  roster_capacity          INTEGER DEFAULT 30,
  battle_wins              INTEGER DEFAULT 0,
  battle_losses            INTEGER DEFAULT 0,
  total_breeds             INTEGER DEFAULT 0,
  total_pulls              INTEGER DEFAULT 0,
  pity_counter_epic        INTEGER DEFAULT 0,
  pity_counter_legendary   INTEGER DEFAULT 0,
  elo_rating               INTEGER DEFAULT 1000,
  is_bot                   BOOLEAN DEFAULT FALSE,
  login_streak             INTEGER DEFAULT 0,
  last_login_date          DATE,
  player_level             INTEGER DEFAULT 1,
  player_xp                INTEGER DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  last_active              TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Player profiles; user_id can match auth.users.id from Supabase Auth';
