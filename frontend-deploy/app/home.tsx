import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as api from '@/lib/api';
import * as guest from '@/lib/guest';

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

  const handleLogout = async () => {
    guest.clearGuest();
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.avatar} />
        <Text style={styles.wordmark}>DOKI</Text>
        <View style={styles.topRight}>
          {currency != null && (
            <Text style={styles.currency}>{currency} 🐾</Text>
          )}
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.main}>
        <Text style={styles.hint}>Tap a button to play</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.actionButton, styles.battle]}
          onPress={() => router.push('/battle')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>⚔️</Text>
          <Text style={styles.actionLabel}>BATTLE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.breed]}
          onPress={() => router.push('/breed')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>💕</Text>
          <Text style={styles.actionLabel}>BREED</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.lootbox]}
          onPress={() => router.push('/lootbox')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🎁</Text>
          <Text style={styles.actionLabel}>LOOT BOX</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.roster]}
          onPress={() => router.push('/roster')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>ROSTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD6E8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFB6D9',
  },
  wordmark: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF69B4',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currency: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  logout: {
    fontSize: 14,
    color: '#9B59B6',
    fontWeight: '600',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 16,
  },
  actionButton: {
    width: 156,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  battle: {
    backgroundColor: '#FF6B6B',
  },
  breed: {
    backgroundColor: '#FF69B4',
  },
  lootbox: {
    backgroundColor: '#FFD700',
  },
  roster: {
    backgroundColor: '#87CEEB',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
});
