import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '@/constants/kawaiiTheme';
import KawaiiIcon from './KawaiiIcon';
import type { KawaiiIconKey } from '@/constants/kawaiiIcons';

const STAT_COLORS: Record<string, string> = {
  power: colors.red,
  toughness: colors.babyBlue,
  speed: colors.mint,
};

const STAT_ICONS: Record<string, KawaiiIconKey> = {
  power: 'stat.power',
  toughness: 'stat.toughness',
  speed: 'stat.speed',
};

type StatType = 'power' | 'toughness' | 'speed';

type Props = {
  type: StatType;
  value: number;
};

export default function StatPill({ type, value }: Props) {
  const color = STAT_COLORS[type] ?? colors.grayMuted;
  const iconName = STAT_ICONS[type] ?? 'reward.sparkle';

  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <KawaiiIcon icon={iconName} size="xs" tone="light" />
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
  },
  value: {
    color: colors.white,
    fontSize: typography.sm,
    fontWeight: typography.fontExtraBold,
  },
});
