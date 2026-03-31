-- Catalog, currency, achievements, failed generations
CREATE TABLE catalog_cats (
  catalog_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(64) NOT NULL,
  rarity         VARCHAR(12) NOT NULL,
  variety        VARCHAR(12) NOT NULL,
  image_url      TEXT NOT NULL,
  variety_tokens JSONB NOT NULL,
  style_score    FLOAT,
  is_available   BOOLEAN DEFAULT TRUE,
  times_served   INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE currency_transactions (
  transaction_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(user_id),
  amount           INTEGER NOT NULL,
  transaction_type VARCHAR(32) CHECK (transaction_type IN (
    'loot_box_pull','battle_reward','breed_cost',
    'daily_bonus','purchase','achievement_reward',
    'cooldown_skip','roster_expansion','refund'
  )) NOT NULL,
  reference_id     UUID,
  balance_after    INTEGER NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(user_id) ON DELETE CASCADE,
  achievement_id VARCHAR(64) NOT NULL,
  unlocked_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE failed_generations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_pair_hash VARCHAR(128),
  rarity          VARCHAR(12),
  variety         VARCHAR(12),
  prompt_used     TEXT,
  error_message   TEXT,
  resolved        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_catalog_rarity ON catalog_cats(rarity, variety, is_available);
