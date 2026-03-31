import { View, Text, StyleSheet } from 'react-native';
import CatWithAccessories from './CatWithAccessories';
import RarityBadge from './RarityBadge';
import StatPill from './StatPill';

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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
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
