import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '@/constants/kawaiiTheme';

const RARITY_COLORS: Record<string, string> = {
  common: colors.grayMuted,
  rare: colors.babyBlue,
  epic: colors.lavender,
  legendary: colors.yellow,
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
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  medium: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontBold,
  },
  textMedium: {
    fontSize: typography.xs,
  },
});
