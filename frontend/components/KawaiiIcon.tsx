import { StyleSheet, TextStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '@/constants/kawaiiTheme';
import { KAWAII_ICONS, type KawaiiIconKey } from '@/constants/kawaiiIcons';
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconTone = 'dark' | 'light' | 'accent' | 'muted' | 'gold';

const ICON_SIZES: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

const ICON_TONES: Record<IconTone, string> = {
  dark: colors.black,
  light: colors.white,
  accent: colors.pinkHot,
  muted: colors.grayMuted,
  gold: colors.yellow,
};

type Props = {
  icon: KawaiiIconKey;
  size?: IconSize;
  tone?: IconTone;
  style?: TextStyle;
};

export default function KawaiiIcon({ icon, size = 'md', tone = 'accent', style }: Props) {
  return (
    <MaterialCommunityIcons
      name={KAWAII_ICONS[icon]}
      size={ICON_SIZES[size]}
      color={ICON_TONES[tone]}
      style={[styles.icon, style]}
    />
  );
}

const styles = StyleSheet.create({
  // Slight pink glow keeps iconography cohesive with kawaii palette.
  icon: {
    textShadowColor: 'rgba(244, 114, 182, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
