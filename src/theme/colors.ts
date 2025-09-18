export const colors = {
  primary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Yellow Taxi brand color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const lightTheme = {
  background: colors.white,
  surface: colors.gray[50],
  card: colors.white,
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    disabled: colors.gray[400],
    inverse: colors.white,
  },
  border: colors.gray[200],
  divider: colors.gray[100],
  shadow: colors.black,
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme = {
  background: colors.gray[900],
  surface: colors.gray[800],
  card: colors.gray[800],
  text: {
    primary: colors.white,
    secondary: colors.gray[300],
    disabled: colors.gray[500],
    inverse: colors.gray[900],
  },
  border: colors.gray[700],
  divider: colors.gray[800],
  shadow: colors.black,
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export type Theme = typeof lightTheme;
