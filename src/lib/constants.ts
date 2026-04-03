export const APP_NAME = 'FareSense';
export const APP_TAGLINE = 'Know before you book.';

export const COLORS = {
  navy: '#0A0F1C',
  surface: '#131B2E',
  surfaceLight: '#1A2340',
  teal: '#00D4AA',
  tealLight: '#00B4D8',
  amber: '#FF9F1C',
  amberLight: '#F97316',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
} as const;

export const CARRIER_NAMES: Record<string, string> = {
  AA: 'American Airlines',
  DL: 'Delta Air Lines',
  UA: 'United Airlines',
  WN: 'Southwest Airlines',
  B6: 'JetBlue Airways',
  AS: 'Alaska Airlines',
  NK: 'Spirit Airlines',
  F9: 'Frontier Airlines',
  HA: 'Hawaiian Airlines',
  SY: 'Sun Country',
  BA: 'British Airways',
  LH: 'Lufthansa',
  AF: 'Air France',
  KL: 'KLM',
  EK: 'Emirates',
  QR: 'Qatar Airways',
  SQ: 'Singapore Airlines',
  CX: 'Cathay Pacific',
  NH: 'ANA',
  JL: 'Japan Airlines',
  AC: 'Air Canada',
  QF: 'Qantas',
  TK: 'Turkish Airlines',
  LX: 'Swiss International',
  AY: 'Finnair',
  SK: 'SAS',
  IB: 'Iberia',
  VS: 'Virgin Atlantic',
};

export const MAX_FORECAST_DAYS = 30;
export const MAX_OFFERS = 20;
