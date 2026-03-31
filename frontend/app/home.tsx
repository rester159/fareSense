import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as api from '@/lib/api';
import * as auth from '@/lib/auth';
import * as guest from '@/lib/guest';
import { colors, spacing, radius, typography } from '@/constants/kawaiiTheme';
import KawaiiActionButton from '@/components/KawaiiActionButton';
import KawaiFloat from '@/components/KawaiFloat';
import KawaiiIcon from '@/components/KawaiiIcon';

export default function HomeScreen() {
  const [currency, setCurrency] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        setCurrency(me.virtual_currency ?? 0);
      } catch {
        setCurrency(0);
      }
    })();
  }, []);

  const handleLogout = () => {
    guest.clearGuest();
    auth.clearToken();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.avatar} />
        <Text style={styles.wordmark}>DOKI</Text>
        <View style={styles.topRight}>
          {currency != null && (
            <View style={styles.currencyWrap}>
              <KawaiiIcon icon="currency.paw" size="md" tone="accent" />
              <Text style={styles.currency}>{currency}</Text>
            </View>
          )}
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.main}>
        <KawaiFloat>
          <Text style={styles.hint}>Tap a button to play~ ✨</Text>
        </KawaiFloat>
      </View>

      <View style={styles.grid}>
        <KawaiiActionButton
          backgroundColor={colors.red}
          onPress={() => router.push('/battle')}
        >
          <KawaiiIcon icon="action.battle" size="xl" tone="light" style={styles.actionIcon} />
          <Text style={styles.actionLabel}>BATTLE</Text>
        </KawaiiActionButton>
        <KawaiiActionButton
          backgroundColor={colors.pinkHot}
          onPress={() => router.push('/breed')}
        >
          <KawaiiIcon icon="action.breed" size="xl" tone="light" style={styles.actionIcon} />
          <Text style={styles.actionLabel}>BREED</Text>
        </KawaiiActionButton>
        <KawaiiActionButton
          backgroundColor={colors.yellow}
          onPress={() => router.push('/lootbox')}
        >
          <KawaiiIcon icon="action.lootbox" size="xl" tone="dark" style={styles.actionIcon} />
          <Text style={[styles.actionLabel, styles.actionLabelDark]}>LOOT BOX</Text>
        </KawaiiActionButton>
        <KawaiiActionButton
          backgroundColor={colors.babyBlue}
          onPress={() => router.push('/roster')}
        >
          <KawaiiIcon icon="action.roster" size="xl" tone="dark" style={styles.actionIcon} />
          <Text style={[styles.actionLabel, styles.actionLabelDark]}>ROSTER</Text>
        </KawaiiActionButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pinkWhisper,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pinkMedium,
    borderWidth: 2,
    borderColor: colors.pinkSoft,
  },
  wordmark: {
    fontSize: typography.xl,
    fontWeight: typography.fontExtraBold,
    color: colors.pinkHot,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currencyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.pinkSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  currency: {
    fontSize: typography.sm,
    fontWeight: typography.fontBold,
    color: colors.black,
  },
  logout: {
    fontSize: typography.sm,
    color: colors.lavender,
    fontWeight: typography.fontSemibold,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: typography.sm,
    color: colors.grayMid,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sectionGap,
    gap: spacing.elementGap,
  },
  actionIcon: {
    fontSize: typography.xl,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: typography.sm,
    fontWeight: typography.fontExtraBold,
    color: colors.white,
  },
  actionLabelDark: {
    color: colors.black,
  },
});
