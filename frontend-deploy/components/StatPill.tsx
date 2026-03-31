import { View, Text, StyleSheet } from 'react-native';

const STAT_COLORS: Record<string, string> = {
  power: '#FF6B6B',
  toughness: '#87CEEB',
  speed: '#98FF98',
};

const STAT_LABELS: Record<string, string> = {
  power: '⚡',
  toughness: '🛡️',
  speed: '💨',
};

type StatType = 'power' | 'toughness' | 'speed';

type Props = {
  type: StatType;
  value: number;
};

export default function StatPill({ type, value }: Props) {
  const color = STAT_COLORS[type] ?? '#999';
  const label = STAT_LABELS[type] ?? type;

  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.label}>{label}</Text>
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
    borderRadius: 12,
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
