import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import CatCard from '@/components/CatCard';
import * as api from '@/lib/api';
import { supabase } from '@/lib/supabase';
import * as guest from '@/lib/guest';

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

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        if (guest.isGuest()) {
          setLoading(false);
          return;
        }
        router.replace('/');
        return;
      }
      setUserId(session.user.id);
      try {
        const roster = await api.getRoster(session.user.id);
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
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  const pages = chunk(cats, CATS_PER_PAGE);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
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
            <TouchableOpacity
              style={[styles.giveButton, giving && styles.giveButtonDisabled]}
              onPress={handleGiveCat}
              disabled={giving}
            >
              {giving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.giveButtonText}>Get a cat (dev)</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={pages}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
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
  back: {
    fontSize: 16,
    color: '#9B59B6',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  error: {
    color: '#c62828',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  giveButton: {
    backgroundColor: '#FF69B4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  giveButtonDisabled: {
    opacity: 0.7,
  },
  giveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  page: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  cardWrap: {
    width: (SCREEN_WIDTH - 48) / 3 - 4,
    alignItems: 'center',
  },
});
