import { View, Text, StyleSheet } from 'react-native';

const RARITY_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#87CEEB',
  epic: '#9B59B6',
  legendary: '#FFD700',
};

type Props = {
  rarity: string;
  size?: 'small' | 'medium';
};

export default function RarityBadge({ rarity, size = 'small' }: Props) {
  const color = RARITY_COLORS[rarity] ?? RARITY_COLORS.common;
  const label = rarity.charAt(0).toUpperCase() + rarity.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: color }, size === 'medium' && styles.medium]}>
      <Text style={[styles.text, size === 'medium' && styles.textMedium]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  medium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  textMedium: {
    fontSize: 12,
  },
});
