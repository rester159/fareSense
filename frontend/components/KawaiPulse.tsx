/**
 * Kawaii pulse — interaction system Section 14: gentle pulse for highlighted elements.
 */
import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function KawaiPulse({ children, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const scale = interpolate(t.value, [0, 1], [1, 1.02]);
    return { transform: [{ scale }] };
  });

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
