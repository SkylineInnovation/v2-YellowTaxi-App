# Expo Migration - TODO List

## ✅ Completed

- [x] Created new branch `feature/migrate-to-expo`
- [x] Updated `package.json` with Expo dependencies
- [x] Updated `app.json` with comprehensive Expo configuration
- [x] Updated `babel.config.js` for Expo preset
- [x] Updated `metro.config.js` for Expo compatibility
- [x] Updated `index.js` entry point for Expo
- [x] Migrated Firebase config to Firebase JS SDK
- [x] Updated `src/services/auth.ts` for Firebase JS SDK
- [x] Created `src/utils/firestoreHelpers.ts` utility
- [x] Created migration documentation
- [x] Created assets folder with README

## 🔄 In Progress / Required Actions

### 1. Firebase Configuration
**Priority: HIGH**

Update `src/config/firebase.ts` with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

**How to get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > General
4. Scroll to "Your apps" section
5. Click on the Web app or add a new Web app
6. Copy the configuration object

### 2. Phone Authentication Setup
**Priority: HIGH**

Firebase JS SDK phone authentication requires additional setup. Choose one option:

**Option A: expo-firebase-recaptcha (Recommended)**
```bash
npx expo install expo-firebase-recaptcha
```

Then update `src/services/auth.ts` to use the recaptcha verifier.

**Option B: Backend Implementation**
Implement phone authentication via Firebase Cloud Functions to avoid reCAPTCHA in mobile app.

**Option C: Keep React Native Firebase**
If phone auth is critical and you can't use recaptcha, consider keeping `@react-native-firebase/auth` just for authentication.

### 3. Update Remaining Firebase Services
**Priority: HIGH**

The following files need to be updated to use Firebase JS SDK:

#### `src/services/rideService.ts`
Replace all Firestore calls:
- `.collection('name').doc('id')` → `doc(firestore, 'name', 'id')`
- `.get()` → `getDoc(docRef)`
- `.set(data)` → `setDoc(docRef, data)`
- `.update(data)` → `updateDoc(docRef, data)`
- `.onSnapshot(callback)` → `onSnapshot(docRef, callback)`
- `.where()` → Import `where` from 'firebase/firestore'
- `.orderBy()` → Import `orderBy` from 'firebase/firestore'

Use the helper functions from `src/utils/firestoreHelpers.ts` for common operations.

#### `src/services/driverService.ts`
Same Firestore API updates as above.

#### `src/services/locationService.ts`
Update to use `expo-location`:
```bash
npx expo install expo-location
```

Replace:
- `react-native-geolocation-service` → `expo-location`
- Permission requests → `Location.requestForegroundPermissionsAsync()`
- `getCurrentPosition` → `Location.getCurrentPositionAsync()`
- `watchPosition` → `Location.watchPositionAsync()`

#### `src/services/notificationService.ts`
Update to use `expo-notifications`:
```bash
npx expo install expo-notifications
```

### 4. Add App Assets
**Priority: MEDIUM**

Create and add the following assets to the `assets/` folder:

- [ ] `icon.png` (1024x1024) - App icon
- [ ] `splash.png` (1284x2778) - Splash screen
- [ ] `adaptive-icon.png` (1024x1024) - Android adaptive icon
- [ ] `favicon.png` (48x48) - Web favicon

See `assets/README.md` for detailed instructions.

### 5. Update Google Maps Configuration
**Priority: MEDIUM**

1. Get your Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Update `app.json`:
   ```json
   {
     "android": {
       "config": {
         "googleMaps": {
           "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
         }
       }
     },
     "plugins": [
       [
         "react-native-maps",
         {
           "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
         }
       ]
     ]
   }
   ```

### 6. Install Dependencies
**Priority: HIGH**

```bash
# Remove old node_modules and lock file
rm -rf node_modules package-lock.json

# Install dependencies
npm install

# For iOS, install pods (if building locally)
cd ios && pod install && cd ..
```

### 7. Update Linear Gradient Usage
**Priority: LOW**

If using `react-native-linear-gradient` anywhere in the code:
- Replace with `expo-linear-gradient`
- Import: `import { LinearGradient } from 'expo-linear-gradient'`

Note: Based on memories, the app uses native gradient layers instead of the library, so this may not be needed.

### 8. Test the Migration
**Priority: HIGH**

```bash
# Start Expo development server
npm start

# Test on Android
npm run android

# Test on iOS  
npm run ios
```

**Testing Checklist:**
- [ ] App launches without errors
- [ ] Language selection works
- [ ] Firebase connection works
- [ ] Authentication flow works (may need recaptcha setup)
- [ ] Maps display correctly
- [ ] Location services work
- [ ] Navigation flows work
- [ ] All screens render correctly
- [ ] Fonts load properly (El Messiri for Arabic)

### 9. Update Environment Variables
**Priority: MEDIUM**

Update `.env` file with:
```
GOOGLE_MAPS_API_KEY=your_actual_key
```

Ensure `.env` is in `.gitignore` (already done).

### 10. Build Configuration
**Priority: LOW**

For production builds, set up EAS Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create builds
eas build --platform android
eas build --platform ios
```

## 📝 Notes

### Breaking Changes
1. **Firebase API**: All Firebase calls now use modular SDK
2. **Phone Auth**: Requires additional setup (recaptcha or backend)
3. **Location**: Now uses Expo Location instead of geolocation-service
4. **Entry Point**: Uses Expo's registerRootComponent

### Compatibility
- ✅ React Navigation: Fully compatible
- ✅ Redux: Fully compatible
- ✅ i18next: Fully compatible
- ✅ Custom fonts: Configured in app.json
- ✅ Maps: Compatible via config plugin
- ⚠️ Phone Auth: Needs additional setup
- ⚠️ Push Notifications: Needs migration to expo-notifications

### Rollback Plan
If migration fails, you can rollback:
```bash
git checkout main
npm install
```

The original React Native setup is preserved in the `main` branch.

## 🆘 Getting Help

- **Expo Documentation**: https://docs.expo.dev/
- **Firebase JS SDK**: https://firebase.google.com/docs/web/setup
- **Migration Guide**: See `docs/EXPO_MIGRATION_GUIDE.md`
- **Community**: Expo Discord, Stack Overflow

## 📊 Progress Tracking

**Overall Progress: 60%**

- Configuration: ✅ 100%
- Firebase Migration: 🔄 50%
- Service Updates: ⏳ 0%
- Assets: ⏳ 0%
- Testing: ⏳ 0%
- Documentation: ✅ 100%

---

**Last Updated**: 2025-10-04
**Branch**: `feature/migrate-to-expo`
**Status**: Ready for dependency installation and service migration
