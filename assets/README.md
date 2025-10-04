# Expo Assets

This folder contains the required assets for the Expo-managed YellowTaxi app.

## Required Assets

### 1. App Icon (`icon.png`)
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Used for iOS and Android app icons
- **Recommendation**: Use the YellowTaxi logo on a transparent or branded background

### 2. Splash Screen (`splash.png`)
- **Size**: 1284x2778 pixels (iPhone 13 Pro Max resolution)
- **Format**: PNG
- **Background Color**: #F59E0B (YellowTaxi primary color - configured in app.json)
- **Purpose**: Displayed while the app is loading
- **Recommendation**: Center the YellowTaxi logo on the branded background

### 3. Adaptive Icon (`adaptive-icon.png`) - Android Only
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Purpose**: Android adaptive icon (foreground layer)
- **Background Color**: #F59E0B (configured in app.json)
- **Recommendation**: Use the YellowTaxi logo centered, leaving safe area around edges

### 4. Favicon (`favicon.png`) - Web Only
- **Size**: 48x48 pixels (or 16x16, 32x32)
- **Format**: PNG or ICO
- **Purpose**: Browser tab icon for web version
- **Recommendation**: Simplified YellowTaxi logo

## How to Generate Assets

### Option 1: Use Existing Logo
If you have the YellowTaxi logo SVG (`logo.svg` in project root):

1. **For icon.png**:
   ```bash
   # Using ImageMagick
   convert -background none -resize 1024x1024 ../logo.svg icon.png
   
   # Or using Inkscape
   inkscape --export-type=png --export-width=1024 --export-height=1024 ../logo.svg -o icon.png
   ```

2. **For splash.png**:
   - Create a 1284x2778 canvas with #F59E0B background
   - Center the YellowTaxi logo
   - Export as PNG

3. **For adaptive-icon.png**:
   - Same as icon.png but ensure logo is centered with padding

### Option 2: Use Online Tools
- [App Icon Generator](https://www.appicon.co/)
- [Expo Asset Generator](https://github.com/expo/expo-cli)

### Option 3: Use Expo's Asset Generation
```bash
# This will help you generate assets from a single source image
npx expo-optimize
```

## Current Status

⚠️ **Assets need to be added**

Please add the following files to this directory:
- [ ] `icon.png` (1024x1024)
- [ ] `splash.png` (1284x2778)
- [ ] `adaptive-icon.png` (1024x1024)
- [ ] `favicon.png` (48x48)

## Asset Guidelines

### Design Considerations
1. **Icon**: Should be recognizable at small sizes (as small as 29x29 on iOS)
2. **Splash**: Should match app branding and provide smooth transition to app
3. **Colors**: Use YellowTaxi brand colors (#F59E0B primary yellow)
4. **Simplicity**: Keep designs simple and clear for better recognition

### Safe Areas
- **Icon**: Keep important content within center 80% of canvas
- **Adaptive Icon**: Android may crop up to 33% from edges
- **Splash**: Keep important content in center, accounting for notches/safe areas

## Testing Assets

After adding assets, test them:

1. **Preview in Expo**:
   ```bash
   npm start
   ```

2. **Check on different devices**:
   - iOS: Various iPhone models
   - Android: Different screen sizes and Android versions
   - Web: Different browsers

3. **Verify**:
   - Icons are clear and recognizable
   - Splash screen displays correctly
   - Colors match brand guidelines
   - No pixelation or distortion

## Additional Resources

- [Expo App Icons Documentation](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo Splash Screens Documentation](https://docs.expo.dev/develop/user-interface/splash-screen/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
