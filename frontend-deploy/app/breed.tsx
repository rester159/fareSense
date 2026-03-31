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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        if (guest.isGuest()) setCats([]);
        else router.replace('/');
        setLoading(false);
        return;
      }
      try {
        const [roster, me] = await Promise.all([api.getRoster(session.user.id), api.getMe()]);
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
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>New cat!</Text>
          <CatCard cat={result} size={140} />
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
        <Text style={styles.title}>Breed</Text>
        <View style={{ width: 60 }} />
      </View>
      <Text style={styles.cost}>Cost: 50 🐾 (you have {currency})</Text>
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
        <Text style={styles.heart}>♥</Text>
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
      <TouchableOpacity
        style={[styles.breedButton, !canBreed && styles.breedButtonDisabled]}
        onPress={handleBreed}
        disabled={!canBreed}
      >
        {breeding ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.breedButtonText}>BREED ✨</Text>
        )}
      </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#FFF0F5' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 8,
  },
  back: { fontSize: 16, color: '#9B59B6', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#333' },
  cost: { fontSize: 12, color: '#666', paddingHorizontal: 16, marginBottom: 8 },
  error: { color: '#c62828', paddingHorizontal: 16, marginBottom: 8 },
  slots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  slot: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFB6D9',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelected: { borderColor: '#FF69B4', backgroundColor: '#fff' },
  slotPlaceholder: { fontSize: 12, color: '#999' },
  heart: { fontSize: 24, color: '#FF69B4' },
  breedButton: {
    alignSelf: 'center',
    backgroundColor: '#FF69B4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    minWidth: 160,
    alignItems: 'center',
  },
  breedButtonDisabled: { opacity: 0.5 },
  breedButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  catList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  catChipSelected: { borderColor: '#FF69B4', backgroundColor: '#FFE4EC' },
  catChipText: { fontSize: 12, maxWidth: 80 },
  resultCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#FF69B4', marginBottom: 16 },
  doneButton: {
    marginTop: 24,
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  doneButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
