import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as api from '@/lib/api';
import * as auth from '@/lib/auth';
import * as guest from '@/lib/guest';
import CatCard from '@/components/CatCard';
import { colors, spacing, radius, typography } from '@/constants/kawaiiTheme';
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
  cooldown_until?: string | null;
};

export default function BreedScreen() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [selected, setSelected] = useState<[string | null, string | null]>([null, null]);
  const [loading, setLoading] = useState(true);
  const [breeding, setBreeding] = useState(false);
  const [result, setResult] = useState<Cat | null>(null);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState(0);

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
        setCurrency(me.virtual_currency ?? 0);
      } catch {
        setCats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleCat = (catId: string) => {
    if (selected[0] === catId) {
      setSelected([selected[1], null]);
      return;
    }
    if (selected[1] === catId) {
      setSelected([selected[0], null]);
      return;
    }
    if (!selected[0]) setSelected([catId, null]);
    else if (!selected[1]) setSelected([selected[0], catId]);
    else setSelected([selected[1], catId]);
  };

  const handleBreed = async () => {
    if (!selected[0] || !selected[1]) return;
    setError('');
    setBreeding(true);
    setResult(null);
    try {
      const { cat } = await api.breedInitiate(selected[0], selected[1]);
      setResult(cat);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Breed failed');
    } finally {
      setBreeding(false);
    }
  };

  const canBreed = selected[0] && selected[1] && currency >= 50 && !breeding;

  if (loading) {
    return <LoadingScreen />;
  }

  if (result) {
    return (
      <View style={[styles.container, { backgroundColor: colors.pinkWhisper }]}>
        <Celebration
          title="New cat! ✨"
          subtitle={result.name}
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
        <Text style={styles.title}>Breed</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.costRow}>
        <KawaiiIcon icon="currency.paw" size="sm" tone="accent" />
        <Text style={styles.cost}>Cost: 50 (you have {currency})</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.slots}>
        <View style={[styles.slot, selected[0] && styles.slotSelected]}>
          {selected[0] ? (
            <CatCard
              cat={cats.find((c) => c.cat_id === selected[0])!}
              size={100}
              showStats={false}
            />
          ) : (
            <Text style={styles.slotPlaceholder}>Tap a cat</Text>
          )}
        </View>
        <KawaiiIcon icon="breed.link" size="xl" tone="accent" />
        <View style={[styles.slot, selected[1] && styles.slotSelected]}>
          {selected[1] ? (
            <CatCard
              cat={cats.find((c) => c.cat_id === selected[1])!}
              size={100}
              showStats={false}
            />
          ) : (
            <Text style={styles.slotPlaceholder}>Tap a cat</Text>
          )}
        </View>
      </View>
      <KawaiiButton
        onPress={handleBreed}
        disabled={!canBreed}
        loading={breeding}
        primaryAction
        style={styles.breedButton}
      >
        BREED ✨
      </KawaiiButton>
      <View style={styles.catList}>
        {cats.map((cat) => (
          <TouchableOpacity
            key={cat.cat_id}
            onPress={() => toggleCat(cat.cat_id)}
            style={[
              styles.catChip,
              (selected[0] === cat.cat_id || selected[1] === cat.cat_id) && styles.catChipSelected,
            ]}
          >
            <Text style={styles.catChipText} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingBottom: spacing.sm,
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
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: typography.fontExtraBold,
    color: colors.black,
  },
  cost: {
    fontSize: typography.xs,
    color: colors.grayMid,
  },
  error: {
    color: colors.error,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontSize: typography.sm,
  },
  slots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.elementGap,
  },
  slot: {
    width: 120,
    height: 120,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.pinkMedium,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelected: {
    borderColor: colors.pinkHot,
    backgroundColor: colors.white,
  },
  slotPlaceholder: {
    fontSize: typography.xs,
    color: colors.grayMuted,
  },
  breedButton: {
    alignSelf: 'center',
    minWidth: 160,
  },
  catList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.input,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.graySoft,
  },
  catChipSelected: {
    borderColor: colors.pinkHot,
    backgroundColor: colors.pinkWhisper,
  },
  catChipText: {
    fontSize: typography.xs,
    maxWidth: 80,
    color: colors.black,
  },
});
