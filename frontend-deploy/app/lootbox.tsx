import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LootBoxOpener from '@/components/LootBoxOpener';
import * as api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import * as guest from '@/lib/guest';

export default function LootBoxScreen() {
  const [currency, setCurrency] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        if (!guest.isGuest()) router.replace('/');
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
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
    backgroundColor: '#2D1B69',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  back: {
    fontSize: 16,
    color: '#E8D5FF',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
});
