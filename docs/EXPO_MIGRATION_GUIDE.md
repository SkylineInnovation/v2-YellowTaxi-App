# Expo Migration Guide

## Overview
This document outlines the migration of the YellowTaxi React Native app from bare React Native to Expo managed workflow.

## Migration Summary

### ✅ Completed Changes

#### 1. **Package Configuration**
- Updated `package.json` with Expo SDK 52 dependencies
- Replaced React Native CLI scripts with Expo CLI commands
- Updated React and React Native to Expo-compatible versions
- Added Expo-specific packages (expo-font, expo-location, expo-linear-gradient, etc.)

#### 2. **Build Configuration**
- **babel.config.js**: Updated to use `babel-preset-expo`
- **metro.config.js**: Updated to use Expo's metro config
- **index.js**: Updated entry point to use `registerRootComponent` from Expo
- **app.json**: Comprehensive Expo configuration with iOS and Android settings

#### 3. **Firebase Migration**
- Migrated from `@react-native-firebase/*` to Firebase JS SDK v10
- Updated `src/config/firebase.ts` to use modular Firebase imports
- Updated `src/services/auth.ts` to use Firebase JS SDK authentication
- Created `src/utils/firestoreHelpers.ts` for Firestore operations

### 📋 Key Dependency Changes

| Package | Before | After |
|---------|--------|-------|
| react-native | 0.81.4 | 0.76.5 |
| react | 19.1.0 | 18.3.1 |
| Firebase | @react-native-firebase/* | firebase@^10.14.0 |
| Linear Gradient | react-native-linear-gradient | expo-linear-gradient |
| Location | react-native-geolocation-service | expo-location |
| AsyncStorage | @react-native-async-storage/async-storage@2.2.0 | @react-native-async-storage/async-storage@1.23.1 |

### 🔧 Configuration Updates

#### app.json
```json
{
  "expo": {
    "name": "YellowTaxi",
    "slug": "yellowtaxiapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "plugins": [
      "expo-font",
      "expo-location",
      "react-native-maps"
    ]
  }
}
```

#### Firebase Configuration
The app now uses Firebase JS SDK instead of React Native Firebase:
- **Authentication**: Uses `firebase/auth` with standard web API
- **Firestore**: Uses `firebase/firestore` with modular API
- **Note**: Phone authentication requires additional setup (see below)

### ⚠️ Important Notes

#### Phone Authentication
Firebase JS SDK phone authentication requires one of the following:
1. **Backend Implementation**: Implement phone auth via Cloud Functions
2. **expo-firebase-recaptcha**: Use Expo's Firebase reCAPTCHA component
3. **Custom Solution**: Implement custom OTP service

**Recommended Approach**: Use expo-firebase-recaptcha for phone authentication:
```bash
npx expo install expo-firebase-recaptcha
```

#### Google Maps
The app uses `react-native-maps` which is compatible with Expo through the config plugin:
```json
{
  "plugins": [
    [
      "react-native-maps",
      {
        "googleMapsApiKey": "YOUR_API_KEY"
      }
    ]
  ]
}
```

### 📦 Installation Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Install Expo CLI** (if not already installed):
   ```bash
   npm install -g expo-cli
   ```

3. **Configure Firebase**:
   - Update `src/config/firebase.ts` with your Firebase config
   - Replace placeholder values with actual Firebase project credentials

4. **Configure Google Maps**:
   - Update `app.json` with your Google Maps API key
   - Ensure API key is enabled for Maps SDK for Android/iOS

5. **Setup Assets**:
   - Add app icon to `assets/icon.png` (1024x1024)
   - Add splash screen to `assets/splash.png`
   - Add adaptive icon to `assets/adaptive-icon.png` (Android)

### 🚀 Running the App

#### Development
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

#### Building for Production

**Using EAS Build** (Recommended):
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

**Using Expo Build** (Classic):
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

### 🔄 Service Updates Required

The following service files need to be updated to use Firebase JS SDK:

1. **src/services/rideService.ts**
   - Replace `.collection().doc()` with `doc(firestore, 'collection', 'id')`
   - Replace `.get()` with `getDoc()`
   - Replace `.set()` with `setDoc()`
   - Replace `.update()` with `updateDoc()`
   - Replace `.onSnapshot()` with `onSnapshot()`

2. **src/services/driverService.ts**
   - Same Firestore API updates as above

3. **src/services/locationService.ts**
   - Update to use `expo-location` instead of `react-native-geolocation-service`
   - Replace permission requests with Expo's permission API

4. **src/services/notificationService.ts**
   - Update to use `expo-notifications` for push notifications

### 📱 Platform-Specific Configuration

#### iOS
- Custom fonts are configured in `app.json` under `ios.infoPlist.UIAppFonts`
- Location permissions are set in `ios.infoPlist`
- Google Services file path: `ios.googleServicesFile`

#### Android
- Permissions are configured in `app.json` under `android.permissions`
- Google Services file path: `android.googleServicesFile`
- Google Maps API key: `android.config.googleMaps.apiKey`

### 🐛 Troubleshooting

#### Issue: Firebase not initialized
**Solution**: Ensure Firebase config in `src/config/firebase.ts` has correct credentials

#### Issue: Phone authentication not working
**Solution**: Implement expo-firebase-recaptcha or backend phone auth

#### Issue: Maps not showing
**Solution**: Verify Google Maps API key is correct and APIs are enabled

#### Issue: Fonts not loading
**Solution**: Ensure fonts are in `src/assets/fonts/` and referenced in `app.json`

### 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase JS SDK Documentation](https://firebase.google.com/docs/web/setup)
- [React Native Maps with Expo](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

### ✅ Testing Checklist

- [ ] App launches successfully
- [ ] Language selection works
- [ ] Phone authentication works (with recaptcha or backend)
- [ ] Maps display correctly
- [ ] Location permissions work
- [ ] Ride booking flow works
- [ ] Real-time updates work
- [ ] Fonts display correctly (Arabic and English)
- [ ] All navigation flows work
- [ ] App builds for Android
- [ ] App builds for iOS

### 🔜 Next Steps

1. **Install dependencies**: `npm install`
2. **Update Firebase config**: Add your Firebase credentials
3. **Add app assets**: Icon, splash screen, adaptive icon
4. **Implement phone auth**: Choose recaptcha or backend approach
5. **Update remaining services**: Complete Firebase JS SDK migration
6. **Test thoroughly**: Verify all features work
7. **Build and deploy**: Use EAS Build for production builds

---

**Migration Status**: ✅ Core configuration complete, services migration in progress
**Branch**: `feature/migrate-to-expo`
**Last Updated**: 2025-10-04
