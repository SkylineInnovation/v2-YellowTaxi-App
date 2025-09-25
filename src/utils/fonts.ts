import { Platform, TextStyle } from 'react-native';

// Font family names for different platforms
export const fonts = {
  arabic: {
    regular: Platform.select({
      ios: 'El Messiri',
      android: 'ElMessiri-Regular',
    }),
    medium: Platform.select({
      ios: 'El Messiri',
      android: 'ElMessiri-Medium',
    }),
    semiBold: Platform.select({
      ios: 'El Messiri',
      android: 'ElMessiri-SemiBold',
    }),
    bold: Platform.select({
      ios: 'El Messiri',
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
    const fontFamily = fonts.arabic[weight] || fonts.arabic.regular || 'System';
    if (__DEV__) {
      console.log(`Arabic font selected: ${fontFamily} for weight: ${weight}`);
    }
    return fontFamily;
  }
  return fonts.english[weight] || fonts.english.regular || 'System';
};

// Helper function to create text style with appropriate font
export const createTextStyle = (
  language: string,
  baseStyle: TextStyle,
  weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular'
): TextStyle => {
  const fontFamily = getFontFamily(language, weight);
  
  // For iOS, we need to use fontWeight along with fontFamily for proper font rendering
  const getFontWeight = (weight: string): TextStyle['fontWeight'] => {
    switch (weight) {
      case 'medium':
        return '500';
      case 'semiBold':
        return '600';
      case 'bold':
        return 'bold';
      default:
        return 'normal';
    }
  };

  const style: TextStyle = {
    ...baseStyle,
    fontFamily,
    // Adjust line height for Arabic text if needed
    ...(language === 'ar' && {
      lineHeight: baseStyle.lineHeight ? baseStyle.lineHeight * 1.1 : undefined,
    }),
  };

  // For iOS Arabic fonts, use fontWeight to ensure proper font variant selection
  if (Platform.OS === 'ios' && language === 'ar') {
    style.fontWeight = getFontWeight(weight);
  }

  // For Android, ensure we don't override the specific font family with fontWeight
  if (Platform.OS === 'android' && language === 'ar') {
    // Remove any existing fontWeight to prevent conflicts with specific font families
    delete style.fontWeight;
  }

  if (__DEV__) {
    console.log(`Font style created:`, {
      language,
      weight,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      platform: Platform.OS,
    });
  }

  return style;
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
