import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CatCard from './CatCard';
import { colors, spacing, radius, typography } from '@/constants/kawaiiTheme';
import KawaiiButton from './KawaiiButton';
import KawaiFloat from './KawaiFloat';
import KawaiiIcon from './KawaiiIcon';

type Cat = {
  cat_id: string;
  name: string;
  rarity: string;
  power: number;
  toughness: number;
  speed: number;
  base_image_url: string;
};

type Props = {
  onPull: (type: 'single' | '10x') => Promise<{ cats: Cat[] }>;
  currency: number;
  onClose: () => void;
};

export default function LootBoxOpener({ onPull, currency, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Cat[] | null>(null);
  const [error, setError] = useState('');

  const canSingle = currency >= 100;
  const can10x = currency >= 900;

  const handlePull = async (type: 'single' | '10x') => {
    setError('');
    setLoading(true);
    try {
      const { cats } = await onPull(type);
      setResult(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pull failed');
    } finally {
      setLoading(false);
    }
  };

  if (result != null) {
    const cat = result[0];
    return (
      <View style={styles.result}>
        <View style={styles.resultTitleWrap}>
          <KawaiiIcon icon="reward.sparkle" size="md" tone="gold" />
          <Text style={styles.resultTitle}>You got a cat!</Text>
        </View>
        <CatCard cat={cat} size={160} />
        <Text style={styles.rarityLabel}>{cat.rarity}</Text>
        <KawaiiButton onPress={onClose} style={styles.doneButton}>
          Done
        </KawaiiButton>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.boxWrap}>
        <KawaiFloat>
          <View style={styles.box} />
        </KawaiFloat>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <KawaiiButton
        onPress={() => handlePull('single')}
        disabled={!canSingle || loading}
        loading={loading}
        primaryAction
        backgroundColor={colors.yellow}
        color={colors.black}
        style={[styles.openButton, (!canSingle || loading) && styles.openButtonDisabled]}
      >
        OPEN BOX — 100
      </KawaiiButton>
      <KawaiiButton
        onPress={() => handlePull('10x')}
        disabled={!can10x || loading}
        loading={loading}
        backgroundColor={colors.peach}
        color={colors.black}
        style={[styles.openButton10, (!can10x || loading) && styles.openButtonDisabled]}
      >
        10× PULL — 900
      </KawaiiButton>
      <View style={styles.currencyRow}>
        <KawaiiIcon icon="currency.paw" size="md" tone="accent" />
        <Text style={styles.currency}>You have {currency}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  boxWrap: {
    marginBottom: spacing.xl,
  },
  box: {
    width: 180,
    height: 180,
    backgroundColor: colors.pinkMedium,
    borderRadius: radius.card,
    borderWidth: 4,
    borderColor: colors.yellow,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
    fontSize: typography.sm,
  },
  openButton: {
    marginBottom: spacing.md,
    minWidth: 200,
  },
  openButton10: {
    marginBottom: spacing.lg,
    minWidth: 200,
  },
  openButtonDisabled: {
    opacity: 0.5,
  },
  currency: {
    fontSize: typography.sm,
    color: colors.black,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  result: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: typography.xl,
    fontWeight: typography.fontExtraBold,
    color: colors.yellow,
    marginBottom: spacing.md,
  },
  resultTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  rarityLabel: {
    fontSize: typography.sm,
    color: colors.black,
    marginTop: spacing.sm,
    textTransform: 'capitalize',
  },
  doneButton: {
    marginTop: spacing.lg,
  },
});
