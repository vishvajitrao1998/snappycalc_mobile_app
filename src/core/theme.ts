export const lightColors = {
  bg: '#F5F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  primary: '#4F46E5',
  primarySoft: '#EEF2FF',
  interest: '#F59E0B',
  gain: '#10B981',
  rowAlt: '#F8FAFC',
  heroBg: '#4F46E5',
  heroText: '#FFFFFF',
  heroMuted: '#C7D2FE',
};
export type Colors = typeof lightColors;

export const darkColors: Colors = {
  bg: '#0B1020',
  card: '#151B2E',
  text: '#F1F5F9',
  muted: '#94A3B8',
  border: '#263049',
  primary: '#818CF8',
  primarySoft: '#232A4A',
  interest: '#FBBF24',
  gain: '#34D399',
  rowAlt: '#1A2138',
  heroBg: '#4F46E5',
  heroText: '#FFFFFF',
  heroMuted: '#C7D2FE',
};

export const radius = { md: 12, lg: 20 };

// Static light palette, still used by the welcome screen.
export const theme = { colors: lightColors, radius };
