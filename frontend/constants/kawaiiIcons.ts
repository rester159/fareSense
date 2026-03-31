import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Semantic icon registry.
 * UI should only reference these keys, never raw icon names.
 */
export const KAWAII_ICONS = {
  'nav.back': 'chevron-left',
  'currency.paw': 'paw',
  'reward.sparkle': 'star-four-points',
  'breed.link': 'heart',
  'action.battle': 'sword-cross',
  'action.breed': 'heart-multiple',
  'action.lootbox': 'gift',
  'action.roster': 'cards-heart',
  'stat.power': 'flash',
  'stat.toughness': 'shield',
  'stat.speed': 'run-fast',
} as const satisfies Record<string, IconName>;

export type KawaiiIconKey = keyof typeof KAWAII_ICONS;
