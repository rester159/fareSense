# 10. Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
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
  is_bot                   BOOLEAN DEFAULT FALSE,          -- true for bot placeholder rows, if any
  login_streak             INTEGER DEFAULT 0,
  last_login_date          DATE,
  player_level             INTEGER DEFAULT 1,
  player_xp                INTEGER DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  last_active              TIMESTAMPTZ DEFAULT NOW()
);

-- CATS
CREATE TABLE cats (
  cat_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID REFERENCES users(user_id) ON DELETE SET NULL,
  name                  VARCHAR(64) NOT NULL,
  rarity                VARCHAR(12) CHECK (rarity IN ('common','rare','epic','legendary')) NOT NULL,
  variety               VARCHAR(12) CHECK (variety IN ('whisker','paws','fluff','shadow','spark')) NOT NULL,
  power                 INTEGER CHECK (power BETWEEN 1 AND 10) NOT NULL,
  toughness             INTEGER CHECK (toughness BETWEEN 1 AND 10) NOT NULL,
  speed                 INTEGER CHECK (speed BETWEEN 1 AND 10) NOT NULL,
  xp                    INTEGER DEFAULT 0,
  cat_level             INTEGER DEFAULT 1,
  generation            INTEGER DEFAULT 0,
  parent1_id            UUID REFERENCES cats(cat_id) ON DELETE SET NULL,
  parent2_id            UUID REFERENCES cats(cat_id) ON DELETE SET NULL,
  breed_pair_hash       VARCHAR(128) UNIQUE,
  base_image_url        TEXT NOT NULL,
  variety_tokens        JSONB,
  cooldown_until        TIMESTAMPTZ,
  is_in_battle          BOOLEAN DEFAULT FALSE,
  battle_wins           INTEGER DEFAULT 0,
  battle_losses         INTEGER DEFAULT 0,
  times_transferred     INTEGER DEFAULT 0,
  acquired_via          VARCHAR(16) CHECK (acquired_via IN ('loot_box','breeding','battle_win')) NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ACCESSORY SLOTS (one row per cat per slot)
CREATE TABLE cat_accessories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id         UUID REFERENCES cats(cat_id) ON DELETE CASCADE,
  slot           VARCHAR(8) CHECK (slot IN ('head','body','waist','back','paw')) NOT NULL,
  accessory_id   UUID REFERENCES accessories(accessory_id) ON DELETE SET NULL,
  equipped_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cat_id, slot)
);

-- ACCESSORIES MASTER TABLE
CREATE TABLE accessories (
  accessory_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(64) NOT NULL,
  slot                  VARCHAR(8) CHECK (slot IN ('head','body','waist','back','paw')) NOT NULL,
  rarity                VARCHAR(12) CHECK (rarity IN ('common','rare','epic','legendary')) NOT NULL,
  image_url             TEXT NOT NULL,
  attachment_x_percent  FLOAT NOT NULL,
  attachment_y_percent  FLOAT NOT NULL,
  scale_factor          FLOAT DEFAULT 1.0,
  z_index               INTEGER NOT NULL,
  rotation_degrees      FLOAT DEFAULT 0,
  description           TEXT,
  is_available          BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- USER ACCESSORY INVENTORY
CREATE TABLE user_accessories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(user_id) ON DELETE CASCADE,
  accessory_id   UUID REFERENCES accessories(accessory_id),
  quantity       INTEGER DEFAULT 1,
  acquired_via   VARCHAR(16) CHECK (acquired_via IN ('loot_box','purchase','event')) NOT NULL,
  acquired_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, accessory_id)
);

-- BREED CACHE (deterministic AI generation results)
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

-- BATTLES
CREATE TABLE battles (
  battle_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id         UUID REFERENCES users(user_id),
  player2_id         UUID REFERENCES users(user_id),      -- NULL for bot battles
  player1_cat_id     UUID REFERENCES cats(cat_id),
  player2_cat_id     UUID REFERENCES cats(cat_id),         -- NULL for bot battles
  winner_id          UUID REFERENCES users(user_id),
  loser_id           UUID REFERENCES users(user_id),
  winning_cat_id     UUID REFERENCES cats(cat_id),
  losing_cat_id      UUID REFERENCES cats(cat_id),
  rounds_played      INTEGER,
  battle_log         JSONB,                                -- bot battles store bot_profile here
  is_pvp             BOOLEAN DEFAULT FALSE,
  is_bot_battle      BOOLEAN DEFAULT FALSE,                -- true when opponent was a bot
  match_quality      VARCHAR(16) DEFAULT 'tight',          -- 'tight', 'wide', 'any_real', 'bot', 'new_player_bot'
  resolution_type    VARCHAR(16) DEFAULT 'normal',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- BOT NAME POOL (pre-populated, kawaii-themed)
CREATE TABLE bot_names (
  id                 SERIAL PRIMARY KEY,
  username           VARCHAR(32) UNIQUE NOT NULL,
  display_name       VARCHAR(64) NOT NULL
);

-- CATALOG CATS (pre-generated loot box pool)
CREATE TABLE catalog_cats (
  catalog_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(64) NOT NULL,
  rarity           VARCHAR(12) NOT NULL,
  variety          VARCHAR(12) NOT NULL,
  image_url        TEXT NOT NULL,
  variety_tokens   JSONB NOT NULL,
  style_score      FLOAT,
  is_available     BOOLEAN DEFAULT TRUE,
  times_served     INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- CURRENCY TRANSACTIONS
CREATE TABLE currency_transactions (
  transaction_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(user_id),
  amount             INTEGER NOT NULL,
  transaction_type   VARCHAR(32) CHECK (transaction_type IN (
    'loot_box_pull','battle_reward','breed_cost',
    'daily_bonus','purchase','achievement_reward',
    'cooldown_skip','roster_expansion','refund'
  )) NOT NULL,
  reference_id       UUID,
  balance_after      INTEGER NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ACHIEVEMENTS
CREATE TABLE user_achievements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(user_id) ON DELETE CASCADE,
  achievement_id   VARCHAR(64) NOT NULL,
  unlocked_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- FAILED GENERATIONS (for retry queue)
CREATE TABLE failed_generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_pair_hash  VARCHAR(128),
  rarity        VARCHAR(12),
  variety       VARCHAR(12),
  prompt_used   TEXT,
  error_message TEXT,
  resolved      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_cats_owner_id    ON cats(owner_id);
CREATE INDEX idx_cats_rarity      ON cats(rarity);
CREATE INDEX idx_cats_cooldown    ON cats(cooldown_until);
CREATE INDEX idx_battles_players   ON battles(player1_id, player2_id);
CREATE INDEX idx_battles_created   ON battles(created_at DESC);
CREATE INDEX idx_battles_bot       ON battles(player1_id, is_bot_battle, created_at);
CREATE INDEX idx_users_elo        ON users(elo_rating DESC);
CREATE INDEX idx_users_active     ON users(last_active DESC);
CREATE INDEX idx_catalog_rarity   ON catalog_cats(rarity, variety, is_available);
```
