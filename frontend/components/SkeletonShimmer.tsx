/**
 * Kawaii skeleton — interaction system Section 10: shape-matched, pink shimmer, no layout shift.
 */
import { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors, radius } from '@/constants/kawaiiTheme';

const EASE_SOFT = Easing.bezier(0.25, 0.46, 0.45, 0.94);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'rect' | 'circle';
};

export default function SkeletonShimmer({ width, height, borderRadius, style, variant = 'rect' }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1800, easing: EASE_SOFT }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const sweepWidth = SCREEN_WIDTH * 0.6;
    const translateX = interpolate(progress.value, [0, 1], [-sweepWidth, SCREEN_WIDTH]);
    return {
      transform: [{ translateX }],
    };
  });

  const isCircle = variant === 'circle';
  const br = borderRadius ?? (isCircle ? 9999 : radius.input);

  return (
    <View
      style={[
        styles.base,
        {
          width: width ?? '100%',
          height: height ?? 20,
          borderRadius: br,
        },
        style,
      ]}
      overflow="hidden"
    >
      <Animated.View style={[styles.shimmer, shimmerStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.grayWarm,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 150,
    backgroundColor: 'rgba(255, 107, 152, 0.15)',
    opacity: 0.8,
  },
});
