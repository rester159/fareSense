import { STYLE_LOCK } from './stylelock.js';
import { FUR_BASE, FUR_ACCENT, EAR_STYLE, TAIL_STYLE, EYE_COLOR, SPECIAL_MARKS, getStatModifiers, RARITY_BLOCKS } from './varietyTokens.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Assemble full image prompt from variety tokens (object or random) and stats/rarity. */
export function assemblePrompt(varietyTokens, stats, rarity) {
  const v = varietyTokens || {};
  const furBase = v.furBase || pick(FUR_BASE);
  const furAccent = v.furAccent || pick(FUR_ACCENT);
  const ear = v.earStyle || pick(EAR_STYLE);
  const tail = v.tailStyle || pick(TAIL_STYLE);
  const eyes = v.eyeColor || pick(EYE_COLOR);
  const mark = v.specialMark != null ? SPECIAL_MARKS[v.specialMark] ?? pick(SPECIAL_MARKS) : pick(SPECIAL_MARKS);

  const statMods = getStatModifiers(stats.power, stats.toughness, stats.speed);
  const rarityBlock = RARITY_BLOCKS[rarity] || RARITY_BLOCKS.common;

  return [
    STYLE_LOCK,
    `Fur: ${furBase} base, ${furAccent} accent.`,
    `Ears: ${ear}.`,
    `Tail: ${tail}.`,
    `Eyes: ${eyes}.`,
    `Mark: ${mark}.`,
    statMods + '.',
    rarityBlock,
  ].join('\n\n');
}
