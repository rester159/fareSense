import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as api from '@/lib/api';
import * as auth from '@/lib/auth';
import * as guest from '@/lib/guest';
import CatCard from '@/components/CatCard';
import { colors, spacing, radius, typography, shadows } from '@/constants/kawaiiTheme';
import LoadingScreen from '@/components/LoadingScreen';
import Celebration from '@/components/Celebration';
import KawaiiButton from '@/components/KawaiiButton';
import KawaiiIcon from '@/components/KawaiiIcon';

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
      if (!auth.getToken() && !guest.isGuest()) {
        router.replace('/');
        setLoading(false);
        return;
      }
      if (guest.isGuest()) {
        setCats([]);
        setLoading(false);
        return;
      }
      try {
        const me = await api.getMe();
        const roster = await api.getRoster(me.user_id);
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
    return <LoadingScreen />;
  }

  if (result != null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.pinkWhisper }]}>
        <Celebration
          title={result.you_won ? 'YOU WIN! ♡' : 'You lost...'}
          subtitle={`${result.rounds_played} rounds`}
          onDismiss={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <KawaiiIcon icon="nav.back" size="lg" tone="accent" />
          <Text style={styles.back}>Back</Text>
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
                <ActivityIndicator color={colors.pinkHot} style={styles.spinner} />
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
    backgroundColor: colors.pinkWhisper,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.fontExtraBold,
    color: colors.black,
  },
  error: {
    color: colors.error,
    paddingHorizontal: spacing.md,
    fontSize: typography.sm,
  },
  empty: {
    padding: spacing.lg,
    color: colors.grayMid,
    textAlign: 'center',
    fontSize: typography.sm,
  },
  list: { padding: spacing.md },
  pickLabel: {
    fontSize: typography.sm,
    color: colors.grayMid,
    marginBottom: spacing.md,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.card,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.pinkSoft,
    ...shadows.resting,
  },
  spinner: { marginLeft: spacing.md },
  fightText: {
    fontSize: typography.base,
    fontWeight: typography.fontBold,
    color: colors.pinkHot,
  },
  resultCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
