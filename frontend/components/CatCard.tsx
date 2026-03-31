import { View, Text, StyleSheet } from 'react-native';
import CatWithAccessories from './CatWithAccessories';
import RarityBadge from './RarityBadge';
import StatPill from './StatPill';
import { colors, radius, typography, shadows } from '@/constants/kawaiiTheme';

type Cat = {
  cat_id: string;
  name: string;
  rarity: string;
  power: number;
  toughness: number;
  speed: number;
  base_image_url: string;
  accessory_slots?: Array<{
    slot: string;
    accessories: {
      image_url: string;
      attachment_x_percent?: number;
      attachment_y_percent?: number;
      scale_factor?: number;
      z_index?: number;
      rotation_degrees?: number;
    } | null;
  }>;
};

type Props = {
  cat: Cat;
  size?: number;
  showStats?: boolean;
};

export default function CatCard({ cat, size = 140, showStats = true }: Props) {
  return (
    <View style={[styles.card, { width: size + 24 }]}>
      <View style={styles.header}>
        <RarityBadge rarity={cat.rarity} />
      </View>
      <CatWithAccessories
        baseImageUrl={cat.base_image_url}
        rarity={cat.rarity}
        accessorySlots={cat.accessory_slots ?? []}
        size={size}
      />
      <Text style={styles.name} numberOfLines={1}>
        {cat.name}
      </Text>
      {showStats && (
        <View style={styles.stats}>
          <StatPill type="power" value={cat.power} />
          <StatPill type="toughness" value={cat.toughness} />
          <StatPill type="speed" value={cat.speed} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.pinkSoft,
    ...shadows.resting,
  },
  header: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  name: {
    fontSize: typography.sm,
    fontWeight: typography.fontBold,
    color: colors.black,
    marginTop: 8,
    maxWidth: '100%',
  },
  stats: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
