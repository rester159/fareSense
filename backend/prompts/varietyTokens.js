/** Layer 2 — Variety token vocabulary (one token per category per cat). */
export const FUR_BASE = [
  'cotton candy pink', 'sky blue', 'lemon yellow', 'mint cream', 'soft lavender',
  'peach cream', 'cloud white', 'warm beige', 'pale lilac', 'soft coral', 'powder blue', 'champagne',
];
export const FUR_ACCENT = [
  'white patches', 'cream belly', 'pink inner ears', 'gold tips', 'blue stripes',
  'lavender spots', 'mint gradient', 'silver shimmer', 'rose cheeks', 'lilac tail tip',
];
export const EAR_STYLE = [
  'rounded cat ears', 'pointed elf ears', 'large floppy ears', 'small neat ears', 'wide spread ears', 'folded ears',
];
export const TAIL_STYLE = [
  'long curled tail', 'short fluffy tail', 'ringed striped tail', 'poofy round tail', 'thin elegant tail', 'double-tip tail',
];
export const EYE_COLOR = [
  'deep blue eyes', 'warm amber eyes', 'forest green eyes', 'soft violet eyes',
  'heterochromia: one blue one pink', 'rose pink eyes', 'gold eyes', 'teal eyes',
];
export const SPECIAL_MARKS = [
  'no special marks', 'small star birthmark on cheek', 'crescent moon marking on forehead',
  'tiny heart on paw', 'diamond pattern on chest', 'swirl marking on tail',
  'dot constellation pattern on back', 'faint galaxy shimmer on fur',
];

export function getStatModifiers(power, toughness, speed) {
  const mods = [];
  if (power <= 3) mods.push('delicate small-framed build');
  else if (power <= 6) mods.push('medium proportional build');
  else mods.push('sturdy strong-shouldered build');
  if (toughness <= 3) mods.push('slender wispy body shape');
  else if (toughness <= 6) mods.push('normal rounded body shape');
  else mods.push('wide round plump body shape');
  if (speed <= 3) mods.push('relaxed sitting pose, half-closed sleepy eyes');
  else if (speed <= 6) mods.push('sitting upright alert pose, open eyes');
  else mods.push('dynamic standing pose, one paw raised, wide alert eyes');
  return mods.join(', ');
}

export const RARITY_BLOCKS = {
  common: 'Simple clean design. 1-2 colors only. No patterns. No special effects.',
  rare: 'Slightly more detailed design. 2-3 colors. Optional subtle pattern (spots or stripes, symmetrical). One eye may have a small sparkle highlight.',
  epic: 'Detailed distinctive design. 3-4 coordinated pastel colors. Symmetrical pattern or ombre effect allowed. Eyes have longer lashes. Very subtle soft outer glow (1px, pastel color matching fur).',
  legendary: 'Striking memorable design. 4-5 carefully coordinated pastel colors. Complex symmetrical pattern. Unique silhouette. Eyes are distinctive (multiple iris colors or asymmetric detail). Subtle aura glow (soft radial gradient, 3px, matching color scheme). Tail has unique coloring or pattern.',
};
