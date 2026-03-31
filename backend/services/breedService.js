import crypto from 'crypto';
import { withTransaction } from '../db.js';

const RARITIES = ['common', 'rare', 'epic', 'legendary'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function breedStats(p1, p2) {
  return {
    power: clamp(
      Math.floor((p1.power + p2.power) / 2) + randomInt(-2, 2),
      1,
      10
    ),
    toughness: clamp(
      Math.floor((p1.toughness + p2.toughness) / 2) + randomInt(-2, 2),
      1,
      10
    ),
    speed: clamp(
      Math.floor((p1.speed + p2.speed) / 2) + randomInt(-2, 2),
      1,
      10
    ),
  };
}

export function breedRarity(r1, r2) {
  const i1 = RARITIES.indexOf(r1);
  const i2 = RARITIES.indexOf(r2);
  const maxTier = Math.max(i1, i2);
  const roll = Math.random();
  const escalation = {
    0: roll < 0.3 ? 1 : 0,
    1: roll < 0.4 ? 2 : 1,
    2: roll < 0.4 ? 3 : 2,
    3: 3,
  };
  return RARITIES[escalation[maxTier] ?? 0];
}

export function hashBreedPair(catId1, catId2) {
  const sorted = [catId1, catId2].sort();
  return crypto.createHash('sha256').update(sorted[0] + ':' + sorted[1]).digest('hex');
}

export async function initiateBreed(userId, parent1Id, parent2Id) {
  return await withTransaction(async (client) => {
    if (parent1Id === parent2Id) throw new Error('CANNOT_BREED_WITH_SELF');

    const p1Res = await client.query(
      'SELECT * FROM cats WHERE cat_id = $1 AND owner_id = $2 FOR UPDATE',
      [parent1Id, userId]
    );
    const p2Res = await client.query(
      'SELECT * FROM cats WHERE cat_id = $1 AND owner_id = $2 FOR UPDATE',
      [parent2Id, userId]
    );
    if (p1Res.rows.length === 0 || p2Res.rows.length === 0) {
      throw new Error('PARENT_NOT_OWNED');
    }
    const p1 = p1Res.rows[0];
    const p2 = p2Res.rows[0];

    const now = new Date();
    if (p1.cooldown_until && new Date(p1.cooldown_until) > now) {
      throw new Error('CAT1_IN_COOLDOWN');
    }
    if (p2.cooldown_until && new Date(p2.cooldown_until) > now) {
      throw new Error('CAT2_IN_COOLDOWN');
    }

    const currencyRes = await client.query(
      'SELECT virtual_currency FROM users WHERE user_id = $1 FOR UPDATE',
      [userId]
    );
    if (currencyRes.rows[0].virtual_currency < 50) {
      throw new Error('INSUFFICIENT_CURRENCY');
    }

    await client.query(
      'UPDATE users SET virtual_currency = virtual_currency - 50 WHERE user_id = $1',
      [userId]
    );

    const cooldownUntil = new Date(now.getTime() + 60 * 60 * 1000);
    await client.query(
      'UPDATE cats SET cooldown_until = $1 WHERE cat_id = $2 OR cat_id = $3',
      [cooldownUntil, parent1Id, parent2Id]
    );

    const offspringStats = breedStats(p1, p2);
    const offspringRarity = breedRarity(p1.rarity, p2.rarity);
    const pairHash = hashBreedPair(parent1Id, parent2Id);

    let name, imageUrl, isNew = false;

    const cacheRes = await client.query(
      'SELECT generated_name, generated_image_url FROM breed_cache WHERE breed_pair_hash = $1',
      [pairHash]
    );

    if (cacheRes.rows.length > 0) {
      name = cacheRes.rows[0].generated_name;
      imageUrl = cacheRes.rows[0].generated_image_url;
    } else {
      isNew = true;
      const catalogRes = await client.query(
        'SELECT name, image_url FROM catalog_cats WHERE is_available = true ORDER BY RANDOM() LIMIT 1'
      );
      const catalog = catalogRes.rows[0] || {};
      imageUrl = catalog.image_url || 'https://placekitten.com/256/256';
      name = catalog.name ? `${catalog.name} Jr.` : `Kitten-${randomInt(1, 9999)}`;
      await client.query(
        `INSERT INTO breed_cache (breed_pair_hash, parent1_id, parent2_id, generated_name, generated_image_url, rarity, power_base, toughness_base, speed_base, variety)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          pairHash,
          parent1Id,
          parent2Id,
          name,
          imageUrl,
          offspringRarity,
          offspringStats.power,
          offspringStats.toughness,
          offspringStats.speed,
          p1.variety || 'whisker',
        ]
      );
    }

    const gen = Math.max(p1.generation || 0, p2.generation || 0) + 1;
    const catRes = await client.query(
      `INSERT INTO cats (owner_id, name, base_image_url, rarity, variety, power, toughness, speed, generation, parent1_id, parent2_id, breed_pair_hash, acquired_via)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'breeding')
       RETURNING *`,
      [
        userId,
        name,
        imageUrl,
        offspringRarity,
        p1.variety || 'whisker',
        offspringStats.power,
        offspringStats.toughness,
        offspringStats.speed,
        gen,
        parent1Id,
        parent2Id,
        pairHash,
      ]
    );

    await client.query(
      'UPDATE users SET total_breeds = total_breeds + 1 WHERE user_id = $1',
      [userId]
    );

    return { cat: catRes.rows[0], isNew };
  });
}
