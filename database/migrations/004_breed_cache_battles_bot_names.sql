-- Breed cache, battles, bot names
CREATE TABLE breed_cache (
  breed_pair_hash      VARCHAR(128) PRIMARY KEY,
  parent1_id           UUID REFERENCES cats(cat_id),
  parent2_id           UUID REFERENCES cats(cat_id),
  generated_name       VARCHAR(64) NOT NULL,
  generated_image_url  TEXT NOT NULL,
  rarity               VARCHAR(12) NOT NULL,
  power_base           INTEGER NOT NULL,
  toughness_base       INTEGER NOT NULL,
  speed_base           INTEGER NOT NULL,
  variety              VARCHAR(12) NOT NULL,
  variety_tokens       JSONB,
  ai_prompt_used       TEXT,
  generation_model     VARCHAR(64),
  is_fallback          BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE battles (
  battle_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id         UUID REFERENCES users(user_id),
  player2_id         UUID REFERENCES users(user_id),
  player1_cat_id     UUID REFERENCES cats(cat_id),
  player2_cat_id     UUID REFERENCES cats(cat_id),
  winner_id          UUID REFERENCES users(user_id),
  loser_id           UUID REFERENCES users(user_id),
  winning_cat_id     UUID REFERENCES cats(cat_id),
  losing_cat_id      UUID REFERENCES cats(cat_id),
  rounds_played      INTEGER,
  battle_log         JSONB,
  is_pvp             BOOLEAN DEFAULT FALSE,
  is_bot_battle      BOOLEAN DEFAULT FALSE,
  match_quality      VARCHAR(16) DEFAULT 'tight',
  resolution_type    VARCHAR(16) DEFAULT 'normal',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bot_names (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(32) UNIQUE NOT NULL,
  display_name VARCHAR(64) NOT NULL
);

CREATE INDEX idx_battles_players ON battles(player1_id, player2_id);
CREATE INDEX idx_battles_created ON battles(created_at DESC);
CREATE INDEX idx_battles_bot    ON battles(player1_id, is_bot_battle, created_at);
CREATE INDEX idx_users_elo     ON users(elo_rating DESC);
CREATE INDEX idx_users_active  ON users(last_active DESC);
