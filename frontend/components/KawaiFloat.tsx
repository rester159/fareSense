/**
 * Kawaii idle animation — interaction system Section 14: gentle ambient float.
 */
import { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  durationMs?: number;
};

export default function KawaiFloat({ children, style, durationMs = 3000 }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: durationMs, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const y = 0 + (Math.sin(t.value * Math.PI) * 10 - 5);
    const rot = 0 + (Math.sin(t.value * Math.PI) * 3 - 1.5);
    return {
      transform: [{ translateY: y }, { rotate: `${rot}deg` }],
    };
  });

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
