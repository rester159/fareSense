import { pool, withTransaction } from '../db.js';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateDamage(attacker, defender) {
  const evasionRoll = randomInt(0, 100);
  if (evasionRoll < defender.speed * 5) {
    return { damage: 0, evaded: true };
  }
  const baseDamage = attacker.power / 2.0 + randomInt(1, 4);
  const defenseReduce = defender.toughness / 4.0 + randomInt(0, 2);
  const damage = Math.max(1, Math.floor(baseDamage - defenseReduce));
  return { damage, evaded: false };
}

export function runFullBattle(playerCat, opponentCat) {
  const p = { ...playerCat, current_hp: playerCat.toughness * 3 };
  const o = { ...opponentCat, current_hp: opponentCat.toughness * 3 };

  const playerInit = p.speed + randomInt(1, 6);
  const opponentInit = o.speed + randomInt(1, 6);
  const [first, second] = playerInit >= opponentInit ? [p, o] : [o, p];

  const log = [];
  let round = 0;

  while (p.current_hp > 0 && o.current_hp > 0) {
    round++;
    const attacker = round % 2 === 1 ? first : second;
    const defender = attacker === p ? o : p;
    const result = calculateDamage(attacker, defender);
    if (!result.evaded) {
      defender.current_hp = Math.max(0, defender.current_hp - result.damage);
    }
    log.push({
      round,
      attacker_id: attacker.cat_id,
      defender_id: defender.cat_id,
      damage: result.damage,
      evaded: result.evaded,
      defender_hp_after: defender.current_hp,
    });
    if (round >= 50) break;
  }

  let winner;
  if (round > 50) {
    const pPct = p.current_hp / (p.toughness * 3);
    const oPct = o.current_hp / (o.toughness * 3);
    winner = pPct >= oPct ? p : o;
  } else if (p.current_hp <= 0 && o.current_hp <= 0) {
    if (p.speed > o.speed) winner = p;
    else if (o.speed > p.speed) winner = o;
    else winner = Math.random() < 0.5 ? p : o;
  } else {
    winner = p.current_hp > 0 ? p : o;
  }
  const loser = winner === p ? o : p;

  return { winner, loser, rounds: round, log };
}

export async function initiateBattle(userId, userCatId) {
  if (!pool) throw new Error('DATABASE_URL required');
  const client = await pool.connect();
  try {
    const catRes = await client.query(
      'SELECT * FROM cats WHERE cat_id = $1 AND owner_id = $2 AND is_in_battle = false FOR UPDATE',
      [userCatId, userId]
    );
    if (catRes.rows.length === 0) {
      throw new Error('CAT_NOT_FOUND_OR_IN_BATTLE');
    }
    const playerCat = catRes.rows[0];

    await client.query('UPDATE cats SET is_in_battle = true WHERE cat_id = $1', [userCatId]);

    const opponentRes = await client.query(
      `SELECT c.* FROM cats c
       JOIN users u ON u.user_id = c.owner_id
       WHERE c.owner_id != $1 AND c.is_in_battle = false
       ORDER BY RANDOM() LIMIT 1`,
      [userId]
    );

    let opponentCat;
    let player2_id = null;
    let is_bot = true;

    if (opponentRes.rows.length > 0) {
      opponentCat = opponentRes.rows[0];
      player2_id = opponentCat.owner_id;
      is_bot = false;
      await client.query('UPDATE cats SET is_in_battle = true WHERE cat_id = $1', [opponentCat.cat_id]);
    } else {
      const catalogRes = await client.query(
        'SELECT * FROM catalog_cats WHERE is_available = true ORDER BY RANDOM() LIMIT 1'
      );
      const catalog = catalogRes.rows[0];
      if (!catalog) throw new Error('NO_OPPONENT');
      const stats = { power: 5, toughness: 5, speed: 5 };
      opponentCat = {
        cat_id: 'bot-' + catalog.catalog_id,
        name: catalog.name,
        base_image_url: catalog.image_url,
        rarity: catalog.rarity,
        variety: catalog.variety || 'whisker',
        power: stats.power,
        toughness: stats.toughness,
        speed: stats.speed,
        owner_id: null,
      };
    }

    const battleRes = await client.query(
      `INSERT INTO battles (player1_id, player2_id, player1_cat_id, player2_cat_id, is_pvp, is_bot_battle, battle_log)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING battle_id`,
      [
        userId,
        player2_id,
        userCatId,
        opponentCat.cat_id?.startsWith('bot-') ? null : opponentCat.cat_id,
        !is_bot,
        is_bot,
        is_bot ? JSON.stringify({ opponent_snapshot: opponentCat }) : null,
      ]
    );
    const battle_id = battleRes.rows[0].battle_id;

    return {
      battle_id,
      player_cat: playerCat,
      opponent_cat: opponentCat,
      is_bot_battle: is_bot,
    };
  } finally {
    client.release();
  }
}

export async function completeBattle(battleId, userId) {
  return await withTransaction(async (client) => {
    const battleRes = await client.query(
      'SELECT * FROM battles WHERE battle_id = $1 AND player1_id = $2 FOR UPDATE',
      [battleId, userId]
    );
    if (battleRes.rows.length === 0) throw new Error('BATTLE_NOT_FOUND');
    const battle = battleRes.rows[0];

    const playerCatRes = await client.query('SELECT * FROM cats WHERE cat_id = $1', [battle.player1_cat_id]);
    const opponentCatRes = battle.player2_cat_id
      ? await client.query('SELECT * FROM cats WHERE cat_id = $1', [battle.player2_cat_id])
      : { rows: [] };

    const playerCat = playerCatRes.rows[0];
    let opponentCat = opponentCatRes.rows[0];
    if (!opponentCat && battle.is_bot_battle) {
      const log = battle.battle_log || {};
      opponentCat = log.opponent_snapshot || null;
    }
    if (!playerCat) throw new Error('CAT_NOT_FOUND');

    let opponentForBattle = opponentCat;
    if (!opponentForBattle && battle.battle_log?.opponent_snapshot) {
      opponentForBattle = battle.battle_log.opponent_snapshot;
    }
    if (!opponentForBattle) {
      opponentForBattle = {
        cat_id: 'bot',
        power: 5,
        toughness: 5,
        speed: 5,
        owner_id: null,
      };
    }

    const { winner, loser, rounds, log } = runFullBattle(playerCat, opponentForBattle);

    const winnerId = winner.owner_id === userId ? userId : battle.player2_id;
    const loserId = winnerId === userId ? battle.player2_id : userId;
    const winningCatId = winner.cat_id?.startsWith('bot-') ? null : winner.cat_id;
    const losingCatId = loser.cat_id?.startsWith('bot-') ? null : loser.cat_id;

    const newLog = { ...(battle.battle_log || {}), log };
    await client.query(
      `UPDATE battles SET winner_id = $1, loser_id = $2, winning_cat_id = $3, losing_cat_id = $4, rounds_played = $5, battle_log = $6
       WHERE battle_id = $7`,
      [winnerId, loserId, winningCatId, losingCatId, rounds, JSON.stringify(newLog), battleId]
    );

    await client.query('UPDATE cats SET is_in_battle = false WHERE cat_id = $1', [battle.player1_cat_id]);
    if (battle.player2_cat_id) {
      await client.query('UPDATE cats SET is_in_battle = false WHERE cat_id = $1', [battle.player2_cat_id]);
    }

    if (!battle.is_bot_battle && losingCatId) {
      await client.query(
        'UPDATE cats SET owner_id = $1, times_transferred = times_transferred + 1 WHERE cat_id = $2',
        [winnerId, losingCatId]
      );
      const winnerUser = await client.query('SELECT elo_rating FROM users WHERE user_id = $1', [winnerId]);
      const loserUser = await client.query('SELECT elo_rating FROM users WHERE user_id = $1', [loserId]);
      if (winnerUser.rows[0] && loserUser.rows[0]) {
        const K = 32;
        const wElo = winnerUser.rows[0].elo_rating;
        const lElo = loserUser.rows[0].elo_rating;
        const expected = 1 / (1 + Math.pow(10, (lElo - wElo) / 400));
        const newWinner = Math.round(wElo + K * (1 - expected));
        const newLoser = Math.round(lElo + K * (0 - (1 - expected)));
        await client.query('UPDATE users SET elo_rating = $1, battle_wins = battle_wins + 1 WHERE user_id = $2', [newWinner, winnerId]);
        await client.query('UPDATE users SET elo_rating = $1, battle_losses = battle_losses + 1 WHERE user_id = $2', [newLoser, loserId]);
      }
    }

    if (winnerId === userId) {
      await client.query('UPDATE users SET virtual_currency = virtual_currency + 5 WHERE user_id = $1', [userId]);
    }

    return {
      winner_id: winnerId,
      loser_id: loserId,
      rounds_played: rounds,
      you_won: winnerId === userId,
      battle_log: log,
    };
  });
}
