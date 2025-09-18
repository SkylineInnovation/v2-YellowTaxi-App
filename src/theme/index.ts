export * from './colors';
export * from './typography';
export * from './spacing';

import { colors, lightTheme, darkTheme, Theme } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, shadows, layout } from './spacing';

export const theme = {
  colors,
  typography,
  textStyles,
  spacing,
  borderRadius,
  shadows,
  layout,
  light: lightTheme,
  dark: darkTheme,
};

export type AppTheme = typeof theme;
export { Theme };
