import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import CatCard from './CatCard';

type Cat = {
  cat_id: string;
  name: string;
  rarity: string;
  power: number;
  toughness: number;
  speed: number;
  base_image_url: string;
};

type Props = {
  onPull: (type: 'single' | '10x') => Promise<{ cats: Cat[] }>;
  currency: number;
  onClose: () => void;
};

export default function LootBoxOpener({ onPull, currency, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Cat[] | null>(null);
  const [error, setError] = useState('');

  const canSingle = currency >= 100;
  const can10x = currency >= 900;

  const handlePull = async (type: 'single' | '10x') => {
    setError('');
    setLoading(true);
    try {
      const { cats } = await onPull(type);
      setResult(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pull failed');
    } finally {
      setLoading(false);
    }
  };

  if (result != null) {
    const cat = result[0];
    return (
      <View style={styles.result}>
        <Text style={styles.resultTitle}>You got a cat!</Text>
        <CatCard cat={cat} size={160} />
        <Text style={styles.rarityLabel}>{cat.rarity}</Text>
        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.boxWrap}>
        <View style={styles.box} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.openButton, (!canSingle || loading) && styles.openButtonDisabled]}
        onPress={() => handlePull('single')}
        disabled={!canSingle || loading}
      >
        <Text style={styles.openButtonText}>
          {loading ? '...' : `OPEN BOX — 100 🐾`}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.openButton10, (!can10x || loading) && styles.openButtonDisabled]}
        onPress={() => handlePull('10x')}
        disabled={!can10x || loading}
      >
        <Text style={styles.openButtonText}>10× PULL — 900 🐾</Text>
      </TouchableOpacity>
      <Text style={styles.currency}>You have {currency} 🐾</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  boxWrap: {
    marginBottom: 32,
  },
  box: {
    width: 180,
    height: 180,
    backgroundColor: '#FFB6D9',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  error: {
    color: '#c62828',
    marginBottom: 8,
  },
  openButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  openButton10: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  openButtonDisabled: {
    opacity: 0.5,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  currency: {
    fontSize: 14,
    color: '#fff',
  },
  result: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 16,
  },
  rarityLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  doneButton: {
    marginTop: 24,
    backgroundColor: '#9B59B6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
