# Font Setup Guide - El Messiri for Arabic Text

## Overview
This guide explains how to add the El Messiri font for Arabic text support in the YellowTaxi React Native app.

## Font Files Required
Download the following El Messiri font files from Google Fonts and place them in `src/assets/fonts/`:

- `ElMessiri-Regular.ttf`
- `ElMessiri-Medium.ttf`
- `ElMessiri-SemiBold.ttf`
- `ElMessiri-Bold.ttf`

## Installation Steps

### 1. Download Font Files
Visit [Google Fonts - El Messiri](https://fonts.google.com/specimen/El+Messiri) and download the font family.

### 2. Add Font Files
Copy the `.ttf` files to `src/assets/fonts/` directory.

### 3. Link Fonts (React Native CLI)
Run the following command to link the fonts:
```bash
npx react-native-asset
```

### 4. iOS Setup (if using manual linking)
Add the font files to your iOS project:
1. Open `ios/yellowtaxiapp.xcodeproj` in Xcode
2. Right-click on your project and select "Add Files to [ProjectName]"
3. Navigate to `src/assets/fonts/` and select all El Messiri font files
4. Make sure "Add to target" is checked for your app target
5. Update `ios/yellowtaxiapp/Info.plist`:

```xml
<key>UIAppFonts</key>
<array>
    <string>ElMessiri-Regular.ttf</string>
    <string>ElMessiri-Medium.ttf</string>
    <string>ElMessiri-SemiBold.ttf</string>
    <string>ElMessiri-Bold.ttf</string>
</array>
```

### 5. Android Setup (if using manual linking)
The fonts should be automatically copied to `android/app/src/main/assets/fonts/` when using `react-native-asset`.

## Usage
The font utility functions in `src/utils/fonts.ts` automatically apply the correct font based on the selected language:

```typescript
import { createTextStyle } from '../utils/fonts';
import { useLanguage } from '../contexts/LanguageContext';

const { currentLanguage } = useLanguage();

// Usage in styles
<Text style={createTextStyle(currentLanguage, styles.text, 'semiBold')}>
  {t('some.translation.key')}
</Text>
```

## Font Weights Available
- `regular` - ElMessiri-Regular
- `medium` - ElMessiri-Medium
- `semiBold` - ElMessiri-SemiBold
- `bold` - ElMessiri-Bold

## Testing
After adding the fonts:
1. Clean and rebuild the app
2. Test Arabic text rendering
3. Verify font weights are applied correctly
4. Test on both iOS and Android devices

## Troubleshooting
- If fonts don't appear, try cleaning the build cache
- Ensure font file names match exactly in the configuration
- Check that fonts are properly linked in both platforms
- Restart Metro bundler after adding fonts
