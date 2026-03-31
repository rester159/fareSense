/**
 * Kawaii loading — interaction system Section 10: pink shimmer skeletons or kawaiFloat character.
 */
import { View, Text, StyleSheet } from 'react-native';
import SkeletonShimmer from './SkeletonShimmer';
import KawaiFloat from './KawaiFloat';
import { colors, spacing } from '@/constants/kawaiiTheme';

type Props = {
  variant?: 'skeleton' | 'character';
};

export default function LoadingScreen({ variant = 'character' }: Props) {
  if (variant === 'skeleton') {
    return (
      <View style={[styles.container, { backgroundColor: colors.pinkWhisper }]}>
        <View style={styles.skeleton}>
          <SkeletonShimmer width={80} height={80} variant="circle" style={{ marginBottom: spacing.lg }} />
          <SkeletonShimmer width="70%" height={24} style={{ marginBottom: spacing.sm }} />
          <SkeletonShimmer width="50%" height={20} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.pinkWhisper }]}>
      <KawaiFloat durationMs={3000}>
        <View style={styles.paw}>
          <Text style={styles.pawEmoji}>🐾</Text>
        </View>
      </KawaiFloat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  paw: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.pinkMedium,
  },
  pawEmoji: {
    fontSize: 32,
  },
});
