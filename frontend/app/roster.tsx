import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import CatCard from '@/components/CatCard';
import * as api from '@/lib/api';
import * as auth from '@/lib/auth';
import * as guest from '@/lib/guest';
import { colors, spacing, radius, typography, shadows } from '@/constants/kawaiiTheme';
import LoadingScreen from '@/components/LoadingScreen';
import KawaiiButton from '@/components/KawaiiButton';
import KawaiiIcon from '@/components/KawaiiIcon';

const CATS_PER_PAGE = 6;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_SIZE = Math.min(140, (SCREEN_WIDTH - 48) / 3 - 16);

type Cat = {
  cat_id: string;
  name: string;
  rarity: string;
  power: number;
  toughness: number;
  speed: number;
  base_image_url: string;
  accessory_slots?: unknown[];
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out.length ? out : [[]];
}

export default function RosterScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [giving, setGiving] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (guest.isGuest()) return;
    setRefreshing(true);
    try {
      const me = await api.getMe();
      setUserId(me.user_id);
      const roster = await api.getRoster(me.user_id);
      setCats(roster);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load roster');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!auth.getToken() && !guest.isGuest()) {
        router.replace('/');
        return;
      }
      if (guest.isGuest()) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.getMe();
        setUserId(me.user_id);
        const roster = await api.getRoster(me.user_id);
        setCats(roster);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load roster');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGiveCat = async () => {
    if (!userId) return;
    setGiving(true);
    setError('');
    try {
      const cat = await api.giveCat();
      setCats((prev) => [cat, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setGiving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const pages = chunk(cats, CATS_PER_PAGE);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <KawaiiIcon icon="nav.back" size="lg" tone="accent" />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Roster</Text>
        <View style={{ width: 60 }} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {cats.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{userId ? 'No cats yet' : 'Playing as guest'}</Text>
          <Text style={styles.emptyHint}>
            {userId ? 'Get your first cat to start!' : 'Log in to save and grow your roster.'}
          </Text>
          {userId ? (
            <KawaiiButton
              onPress={handleGiveCat}
              disabled={giving}
              loading={giving}
              style={styles.giveButton}
            >
              Get a cat (dev)
            </KawaiiButton>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          refreshControl={
            userId ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[colors.pinkHot]}
                tintColor={colors.pinkHot}
              />
            ) : undefined
          }
          renderItem={({ item: page }) => (
            <View style={[styles.page, { width: SCREEN_WIDTH }]}>
              {[0, 1].map((row) => (
                <View key={row} style={styles.row}>
                  {page.slice(row * 3, row * 3 + 3).map((cat) => (
                    <View key={cat.cat_id} style={styles.cardWrap}>
                      <CatCard cat={cat} size={CARD_SIZE} />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        />
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
    paddingBottom: spacing.sm,
    fontSize: typography.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.fontExtraBold,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.sm,
    color: colors.grayMid,
    marginBottom: spacing.lg,
  },
  giveButton: {},
  page: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  cardWrap: {
    width: (SCREEN_WIDTH - 48) / 3 - 4,
    alignItems: 'center',
  },
});
