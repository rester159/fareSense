import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LootBoxOpener from '@/components/LootBoxOpener';
import * as api from '@/lib/api';
import * as auth from '@/lib/auth';
import * as guest from '@/lib/guest';
import { colors, spacing, typography } from '@/constants/kawaiiTheme';
import KawaiiIcon from '@/components/KawaiiIcon';

export default function LootBoxScreen() {
  const [currency, setCurrency] = useState(0);

  useEffect(() => {
    (async () => {
      if (!auth.getToken() && !guest.isGuest()) {
        router.replace('/');
        setCurrency(0);
        return;
      }
      try {
        const me = await api.getMe();
        setCurrency(me.virtual_currency ?? 0);
      } catch {
        setCurrency(0);
      }
    })();
  }, []);

  const refreshCurrency = async () => {
    try {
      const me = await api.getMe();
      setCurrency(me.virtual_currency ?? 0);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <KawaiiIcon icon="nav.back" size="lg" tone="accent" />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Loot Box</Text>
        <View style={{ width: 60 }} />
      </View>
      <LootBoxOpener
        currency={currency}
        onPull={async (type) => {
          const res = await api.lootboxPull(type);
          await refreshCurrency();
          return res;
        }}
        onClose={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lilac,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  back: {
    fontSize: typography.sm,
    color: colors.pinkHot,
    fontWeight: typography.fontSemibold,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.pinkSoft,
    borderRadius: 9999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.fontExtraBold,
    color: colors.black,
  },
});
