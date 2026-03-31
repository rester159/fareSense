/**
 * Kawaii action button — same 3D press as KawaiiButton, for home grid (custom bg + content).
 */
import { useCallback } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, radius, shadows, duration } from '@/constants/kawaiiTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE_BOUNCE = Easing.bezier(0.34, 1.56, 0.64, 1);
const EASE_SOFT = Easing.bezier(0.25, 0.46, 0.45, 0.94);

type Props = {
  onPress?: () => void;
  children: React.ReactNode;
  backgroundColor: string;
  style?: ViewStyle;
};

export default function KawaiiActionButton({ onPress, children, backgroundColor, style }: Props) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const bottomBorder = useSharedValue(4);

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.92, { duration: duration.instant, easing: EASE_SOFT });
    translateY.value = withTiming(4, { duration: duration.instant, easing: EASE_SOFT });
    bottomBorder.value = withTiming(0, { duration: duration.instant });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.05, { duration: duration.fast, easing: EASE_BOUNCE }),
      withTiming(1, { duration: duration.fast, easing: EASE_SOFT })
    );
    translateY.value = withTiming(0, { duration: duration.fast, easing: EASE_BOUNCE });
    bottomBorder.value = withTiming(4, { duration: duration.fast });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    backgroundColor,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.black,
    borderBottomWidth: bottomBorder.value,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: shadows.resting.shadowColor,
    shadowOffset: shadows.resting.shadowOffset,
    shadowOpacity: scale.value < 1 ? 0.2 : 0.15,
    shadowRadius: scale.value < 1 ? 4 : 12,
    elevation: scale.value < 1 ? 2 : 4,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.base, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = {
  base: {
    width: 156,
    height: 80,
  },
};
