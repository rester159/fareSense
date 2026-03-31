-- Cats and cat_accessories
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

CREATE TABLE cat_accessories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id         UUID REFERENCES cats(cat_id) ON DELETE CASCADE,
  slot           VARCHAR(8) CHECK (slot IN ('head','body','waist','back','paw')) NOT NULL,
  accessory_id   UUID REFERENCES accessories(accessory_id) ON DELETE SET NULL,
  equipped_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cat_id, slot)
);

CREATE INDEX idx_cats_owner_id ON cats(owner_id);
CREATE INDEX idx_cats_rarity   ON cats(rarity);
CREATE INDEX idx_cats_cooldown ON cats(cooldown_until);
