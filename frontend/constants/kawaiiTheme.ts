/**
 * Kawaii design system — from docs/kawaii-ui-bible.md and docs/kawaii-interaction-system.md
 * Use these tokens for ALL UI. Never invent colors.
 */

export const colors = {
  // Primary palette
  red: '#E4002B',
  pinkHot: '#FF6B98',
  pinkMedium: '#F9A8C9',
  pinkSoft: '#FDD5E5',
  pinkWhisper: '#FFF0F5',
  white: '#FFFFFF',
  yellow: '#FFD644',
  black: '#2D2D2D',
  // Extended
  lavender: '#D8B4FE',
  mint: '#A7F3D0',
  babyBlue: '#BAE6FD',
  peach: '#FDDCB5',
  cream: '#FFF8E7',
  lilac: '#E8D5F5',
  // Functional
  success: '#5EE0A0',
  warning: '#FFD644',
  error: '#FF6B98',
  info: '#BAE6FD',
  // Warm grays (never pure gray)
  grayWarm: '#F5E6EC',
  graySoft: '#E8DFE3',
  grayMid: '#4A4A4A',
  grayMuted: '#C9A0B0',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  cardPadding: 24,
  buttonPaddingX: 32,
  buttonPaddingY: 14,
  inputPadding: 16,
  elementGap: 16,
  sectionGap: 48,
} as const;

export const radius = {
  pill: 9999,
  input: 16,
  card: 24,
  cardLarge: 32,
} as const;

export const typography = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  xxxl: 48,
  fontMedium: '500' as const,
  fontSemibold: '600' as const,
  fontBold: '700' as const,
  fontExtraBold: '800' as const,
  letterSpacingBody: 0.02,
  letterSpacingHeadline: 0.05,
  letterSpacingButton: 0.08,
  lineHeightBody: 1.6,
  lineHeightHeadline: 1.3,
} as const;

/** Pink-tinted shadows — never gray/black */
export const shadows = {
  resting: {
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  hover: {
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  pressed: {
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

/** Background gradient — warm pink/cream */
export const backgroundGradient = ['#FFF0F5', '#FDD5E5', '#FFF8E7'];

/** Easing curves for animations — interaction system Section "GLOBAL ANIMATION CONSTANTS" */
export const easing = {
  bounce: [0.34, 1.56, 0.64, 1] as const,
  soft: [0.25, 0.46, 0.45, 0.94] as const,
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  squish: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

/** Duration scale — interaction system Section "GLOBAL ANIMATION CONSTANTS" */
export const duration = {
  instant: 100,
  fast: 200,
  normal: 350,
  slow: 500,
  dramatic: 800,
} as const;
