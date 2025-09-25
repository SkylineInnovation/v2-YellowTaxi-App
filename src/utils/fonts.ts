import { Platform, TextStyle } from 'react-native';

// Font family names for different platforms
export const fonts = {
  arabic: {
    regular: Platform.select({
      ios: 'ElMessiri-Regular',
      android: 'ElMessiri-Regular',
    }),
    medium: Platform.select({
      ios: 'ElMessiri-Medium',
      android: 'ElMessiri-Medium',
    }),
    semiBold: Platform.select({
      ios: 'ElMessiri-SemiBold',
      android: 'ElMessiri-SemiBold',
    }),
    bold: Platform.select({
      ios: 'ElMessiri-Bold',
      android: 'ElMessiri-Bold',
    }),
  },
  english: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    semiBold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
    }),
  },
};

// Helper function to get appropriate font family based on language
export const getFontFamily = (
  language: string,
  weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular'
): string => {
  if (language === 'ar') {
    return fonts.arabic[weight] || fonts.arabic.regular || 'System';
  }
  return fonts.english[weight] || fonts.english.regular || 'System';
};

// Helper function to create text style with appropriate font
export const createTextStyle = (
  language: string,
  baseStyle: TextStyle,
  weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular'
): TextStyle => {
  return {
    ...baseStyle,
    fontFamily: getFontFamily(language, weight),
    // Adjust line height for Arabic text if needed
    ...(language === 'ar' && {
      lineHeight: baseStyle.lineHeight ? baseStyle.lineHeight * 1.1 : undefined,
    }),
  };
};

// Text direction helper
export const getTextAlign = (language: string, defaultAlign: 'left' | 'center' | 'right' = 'left') => {
  if (language === 'ar') {
    switch (defaultAlign) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return defaultAlign;
    }
  }
  return defaultAlign;
};
