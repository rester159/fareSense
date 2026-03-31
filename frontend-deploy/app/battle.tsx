import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import * as guest from '@/lib/guest';
import CatCard from '@/components/CatCard';

type Cat = {
  cat_id: string;
  name: string;
  rarity: string;
  power: number;
  toughness: number;
  speed: number;
  base_image_url: string;
};

export default function BattleScreen() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [fighting, setFighting] = useState(false);
  const [result, setResult] = useState<{ you_won: boolean; rounds_played: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        if (guest.isGuest()) setCats([]);
        else router.replace('/');
        setLoading(false);
        return;
      }
      try {
        const roster = await api.getRoster(session.user.id);
        setCats(roster);
      } catch {
        setCats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleBattle = async (catId: string) => {
    setError('');
    setFighting(true);
    setResult(null);
    try {
      const { battle_id, player_cat, opponent_cat } = await api.battleInitiate(catId);
      await new Promise((r) => setTimeout(r, 1500));
      const res = await api.battleComplete(battle_id);
      setResult({ you_won: res.you_won, rounds_played: res.rounds_played });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Battle failed');
    } finally {
      setFighting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  if (result != null) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{result.you_won ? 'YOU WIN!' : 'You lost...'}</Text>
          <Text style={styles.resultRounds}>{result.rounds_played} rounds</Text>
          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Battle</Text>
        <View style={{ width: 60 }} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {cats.length === 0 ? (
        <Text style={styles.empty}>No cats. Get one from Loot Box or Roster.</Text>
      ) : (
        <View style={styles.list}>
          <Text style={styles.pickLabel}>Pick a cat to battle:</Text>
          {cats.map((cat) => (
            <TouchableOpacity
              key={cat.cat_id}
              style={styles.catRow}
              onPress={() => handleBattle(cat.cat_id)}
              disabled={fighting}
            >
              <CatCard cat={cat} size={80} showStats={false} />
              {fighting ? (
                <ActivityIndicator color="#FF69B4" style={styles.spinner} />
              ) : (
                <Text style={styles.fightText}>Fight</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8D5FF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8D5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  back: { fontSize: 16, color: '#9B59B6', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#333' },
  error: { color: '#c62828', paddingHorizontal: 16 },
  empty: { padding: 24, color: '#666', textAlign: 'center' },
  list: { padding: 16 },
  pickLabel: { fontSize: 14, color: '#666', marginBottom: 12 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  spinner: { marginLeft: 16 },
  fightText: { fontSize: 16, fontWeight: '700', color: '#FF69B4' },
  resultCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#FF69B4', marginBottom: 8 },
  resultRounds: { fontSize: 14, color: '#666', marginBottom: 24 },
  doneButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
