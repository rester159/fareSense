import { pool, withTransaction } from '../db.js';

const RARITIES = ['common', 'rare', 'epic', 'legendary'];
const VARIETIES = ['whisker', 'paws', 'fluff', 'shadow', 'spark'];

const RARITY_RANGES = {
  common: [1, 3],
  rare: [3, 6],
  epic: [5, 8],
  legendary: [7, 10],
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function generateStatsForRarity(rarity) {
  const [min, max] = RARITY_RANGES[rarity] ?? [1, 3];
  return {
    power: clamp(randomInt(min, max) + randomInt(-1, 1), min, max),
    toughness: clamp(randomInt(min, max) + randomInt(-1, 1), min, max),
    speed: clamp(randomInt(min, max) + randomInt(-1, 1), min, max),
  };
}

function weightedRarityRoll() {
  const roll = Math.random() * 100;
  if (roll < 3) return 'legendary';
  if (roll < 15) return 'epic';
  if (roll < 40) return 'rare';
  return 'common';
}

function checkPity(user) {
  if (user.pity_counter_legendary >= 99) return 'legendary';
  if (user.pity_counter_epic >= 49) return 'epic';
  return null;
}

async function getRandomCatalogCat(client, rarity) {
  const variety = VARIETIES[randomInt(0, VARIETIES.length - 1)];
  let res = await client.query(
    `SELECT catalog_id, name, image_url, variety_tokens, variety FROM catalog_cats 
     WHERE rarity = $1 AND is_available = true ORDER BY RANDOM() LIMIT 1`,
    [rarity]
  );
  if (res.rows.length === 0) {
    res = await client.query(
      `SELECT catalog_id, name, image_url, variety_tokens, variety FROM catalog_cats 
       WHERE is_available = true ORDER BY RANDOM() LIMIT 1`
    );
  }
  const row = res.rows[0];
  return row ? { ...row, rarity: row.rarity || rarity } : null;
}

export async function executePull(userId, pullType = 'single') {
  const cost = pullType === 'single' ? 100 : 900;
  const pullCount = pullType === 'single' ? 1 : 10;

  return await withTransaction(async (client) => {
    const userRes = await client.query(
      'SELECT virtual_currency, pity_counter_epic, pity_counter_legendary, total_pulls FROM users WHERE user_id = $1 FOR UPDATE',
      [userId]
    );
    if (userRes.rows.length === 0) throw new Error('USER_NOT_FOUND');
    const user = userRes.rows[0];
    if (user.virtual_currency < cost) throw new Error('INSUFFICIENT_CURRENCY');

    await client.query(
      'UPDATE users SET virtual_currency = virtual_currency - $1, total_pulls = total_pulls + $2 WHERE user_id = $3',
      [cost, pullCount, userId]
    );

    const results = [];
    let pityEpic = user.pity_counter_epic;
    let pityLegendary = user.pity_counter_legendary;

    for (let i = 0; i < pullCount; i++) {
      let rarity = checkPity({ pity_counter_epic: pityEpic, pity_counter_legendary: pityLegendary });
      if (!rarity) rarity = weightedRarityRoll();

      if (rarity === 'legendary') pityLegendary = 0;
      else pityLegendary += 1;
      if (rarity === 'epic') pityEpic = 0;
      else pityEpic += 1;

      const catalog = await getRandomCatalogCat(client, rarity);
      if (!catalog) throw new Error('NO_CATALOG_CAT');

      const stats = generateStatsForRarity(rarity);
      const catRes = await client.query(
        `INSERT INTO cats (owner_id, name, base_image_url, variety_tokens, rarity, variety, power, toughness, speed, generation, acquired_via)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 'loot_box')
         RETURNING *`,
        [
          userId,
          catalog.name,
          catalog.image_url,
          JSON.stringify(catalog.variety_tokens || {}),
          rarity,
          catalog.variety || 'whisker',
          stats.power,
          stats.toughness,
          stats.speed,
        ]
      );
      results.push(catRes.rows[0]);

      await client.query(
        'UPDATE catalog_cats SET times_served = times_served + 1 WHERE catalog_id = $1',
        [catalog.catalog_id]
      );
    }

    await client.query(
      'UPDATE users SET pity_counter_epic = $1, pity_counter_legendary = $2 WHERE user_id = $3',
      [pityEpic, pityLegendary, userId]
    );

    return results;
  });
}
