/**
 * Kawaii Button — interaction system Section 2: 3D extruded, press depresses, release springs with overshoot.
 */
import { useCallback } from 'react';
import { Text, Pressable, ViewStyle, TextStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, shadows, duration, easing } from '@/constants/kawaiiTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'ghost' | 'action';

const variantStyles: Record<Variant, { bg: string; border: string; text: string }> = {
  primary: { bg: colors.pinkHot, border: colors.red, text: colors.white },
  secondary: { bg: colors.white, border: colors.pinkHot, text: colors.pinkHot },
  ghost: { bg: 'transparent', border: colors.pinkMedium, text: colors.pinkHot },
  action: { bg: colors.pinkHot, border: colors.black, text: colors.white },
};

type Props = {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
  primaryAction?: boolean;
  /** Override background (e.g. yellow for lootbox) */
  backgroundColor?: string;
  /** Override text color when using backgroundColor */
  color?: string;
};

const EASE_BOUNCE = Easing.bezier(easing.bounce[0], easing.bounce[1], easing.bounce[2], easing.bounce[3]);
const EASE_SOFT = Easing.bezier(easing.soft[0], easing.soft[1], easing.soft[2], easing.soft[3]);

export default function KawaiiButton({
  onPress,
  children,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  loading = false,
  primaryAction = false,
  backgroundColor: bgOverride,
  color: colorOverride,
}: Props) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const bottomBorder = useSharedValue(4);

  const v = variantStyles[variant];
  const bg = bgOverride ?? v.bg;
  const textColor = colorOverride ?? v.text;
  const borderColor = bgOverride ? colors.black : v.border;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    backgroundColor: bg,
    borderWidth: 2.5,
    borderColor,
    borderRadius: radius.pill,
    paddingVertical: spacing.buttonPaddingY,
    paddingHorizontal: spacing.buttonPaddingX,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderBottomWidth: bottomBorder.value,
    shadowColor: shadows.resting.shadowColor,
    shadowOffset: shadows.resting.shadowOffset,
    shadowOpacity: scale.value < 1 ? 0.2 : 0.15,
    shadowRadius: scale.value < 1 ? 4 : 12,
    elevation: scale.value < 1 ? 2 : 4,
  }));

  const handlePressIn = useCallback(() => {
    if (disabled || loading) return;
    scale.value = withTiming(0.92, { duration: duration.instant, easing: EASE_SOFT });
    translateY.value = withTiming(4, { duration: duration.instant, easing: EASE_SOFT });
    bottomBorder.value = withTiming(0, { duration: duration.instant });
  }, [disabled, loading]);

  const handlePressOut = useCallback(() => {
    scale.value = withSequence(
      withTiming(1.05, { duration: duration.fast, easing: EASE_BOUNCE }),
      withTiming(1, { duration: duration.fast, easing: EASE_SOFT })
    );
    translateY.value = withTiming(0, { duration: duration.fast, easing: EASE_BOUNCE });
    bottomBorder.value = withTiming(4, { duration: duration.fast });
  }, []);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[animatedStyle, style]}
      accessibilityRole="button"
    >
      {loading ? (
        <Text style={[styles.text, { color: textColor }, textStyle]}>...</Text>
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>{children}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = {
  text: {
    fontSize: typography.base,
    fontWeight: typography.fontBold as const,
  },
};
