-- One placeholder catalog cat so dev give-cat and future loot box have something to pull.
-- image_url: use any 256x256 transparent or placeholder PNG URL, or replace after run.
INSERT INTO catalog_cats (name, rarity, variety, image_url, variety_tokens, is_available)
VALUES (
  'Mochi',
  'common',
  'whisker',
  'https://placekitten.com/256/256',
  '{"furBase":"peach cream","furAccent":"cream belly","earStyle":"rounded cat ears","tailStyle":"short fluffy tail","eyeColor":"deep blue eyes","specialMark":"no special marks"}'::jsonb,
  true
)
;
