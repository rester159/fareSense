-- Accessories master table (must exist before cat_accessories)
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

CREATE TABLE user_accessories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(user_id) ON DELETE CASCADE,
  accessory_id   UUID REFERENCES accessories(accessory_id),
  quantity       INTEGER DEFAULT 1,
  acquired_via   VARCHAR(16) CHECK (acquired_via IN ('loot_box','purchase','event')) NOT NULL,
  acquired_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, accessory_id)
);
