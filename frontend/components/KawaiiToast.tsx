/**
 * Kawaii toast — interaction system Section 12: slides down with spring, overshoots, settles.
 */
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography, radius, spacing, duration } from '@/constants/kawaiiTheme';

const EASE_BOUNCE = Easing.bezier(0.34, 1.56, 0.64, 1);

type ToastType = 'success' | 'error' | 'info';

type Props = {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
};

export default function KawaiiToast({
  message,
  type = 'info',
  visible,
  onDismiss,
  durationMs = 3500,
}: Props) {
  const translateY = useSharedValue(-200);
  const overshoot = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSequence(
        withTiming(8, { duration: duration.normal, easing: EASE_BOUNCE }),
        withTiming(0, { duration: 100, easing: Easing.linear })
      );
      const t = setTimeout(onDismiss, durationMs);
      return () => clearTimeout(t);
    } else {
      translateY.value = withTiming(-200, { duration: duration.normal });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const bg = type === 'error' ? colors.error : type === 'success' ? colors.success : colors.info;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bg }, animatedStyle]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.card,
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  text: {
    color: colors.black,
    fontSize: typography.sm,
    fontWeight: typography.fontSemibold as '600',
  },
});
