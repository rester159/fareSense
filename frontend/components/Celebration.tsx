/**
 * Kawaii celebration — interaction system Section 11: maximalist reward reveal.
 */
import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, radius, spacing, duration } from '@/constants/kawaiiTheme';

const EASE_SQUISH = Easing.bezier(0.68, -0.55, 0.265, 1.55);
const EASE_BOUNCE = Easing.bezier(0.34, 1.56, 0.64, 1);
const EASE_SOFT = Easing.bezier(0.25, 0.46, 0.45, 0.94);

type Props = {
  title: string;
  subtitle?: string;
  onDismiss: () => void;
  showAt?: number;
};

const PARTICLE_CHARS = ['♡', '☆', '✦', '·'];
const PARTICLE_COLORS = [colors.pinkHot, colors.yellow, colors.lavender, colors.mint, colors.red];

function Particle({ char, color, delay, index }: { char: string; color: string; delay: number; index: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const angle = (index / 12) * Math.PI * 2;
    const dist = 60 + index * 3;
    translateX.value = withDelay(delay, withTiming(Math.cos(angle) * dist, { duration: 600, easing: EASE_SOFT }));
    translateY.value = withDelay(delay, withTiming(Math.sin(angle) * dist + 20, { duration: 600, easing: EASE_SOFT }));
    opacity.value = withDelay(delay + 400, withTiming(0, { duration: 200 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.particleWrap, animStyle]}>
      <Text style={[styles.particle, { color }]}>{char}</Text>
    </Animated.View>
  );
}

export default function Celebration({ title, subtitle, onDismiss }: Props) {
  const mainScale = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  useEffect(() => {
    mainScale.value = withSequence(
      withTiming(1.2, { duration: 200, easing: EASE_SQUISH }),
      withTiming(1, { duration: 200, easing: EASE_SOFT })
    );
    buttonScale.value = withDelay(1000, withSequence(
      withTiming(1.15, { duration: 200, easing: EASE_BOUNCE }),
      withTiming(1, { duration: 150, easing: EASE_SOFT })
    ));
  }, []);

  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.particleContainer}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Particle
            key={i}
            char={PARTICLE_CHARS[i % PARTICLE_CHARS.length]}
            color={PARTICLE_COLORS[i % PARTICLE_COLORS.length]}
            delay={400 + i * 30}
            index={i}
          />
        ))}
      </View>
      <Animated.View style={[styles.main, mainStyle]}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Animated.View>
      <Animated.View style={buttonStyle}>
        <TouchableOpacity onPress={onDismiss} activeOpacity={0.9}>
          <Text style={styles.button}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  particleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particleWrap: {
    position: 'absolute',
  },
  particle: {
    fontSize: 18,
  },
  main: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.xxxl,
    fontWeight: typography.fontExtraBold as '800',
    color: colors.pinkHot,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.lg,
    color: colors.grayMid,
    marginTop: spacing.sm,
  },
  button: {
    backgroundColor: colors.pinkHot,
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.fontBold as '700',
    paddingVertical: spacing.buttonPaddingY,
    paddingHorizontal: spacing.buttonPaddingX,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
