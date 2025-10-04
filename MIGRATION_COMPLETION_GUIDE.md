# Expo Migration - Completion Guide

## ✅ Completed Tasks

### 1. Firebase Configuration - DONE ✅
- Updated `src/config/firebase.ts` with actual Firebase credentials
- API Key: `AIzaSyBV99Kd9kmI7p_E11HG_lC4vIKPvjqKZ_I`
- Project ID: `yellowtaxi-rides`
- All Firebase config values extracted from `google-services.json`

### 2. Google Maps Configuration - DONE ✅
- Updated `app.json` with Google Maps API key
- API Key: `AIzaSyDyfbLegHVXSwjhSvKeC3aYjwhV5mOifqw`
- Configured for both Android and react-native-maps plugin

### 3. Core Migration - DONE ✅
- Package.json updated with Expo dependencies
- Babel, Metro, and entry point configured
- Auth service migrated to Firebase JS SDK
- Firestore helpers created

## 🔄 Remaining Tasks

### Task 1: Update Ride Service (HIGH PRIORITY)

The `src/services/rideService.ts` needs to be updated to use Firebase JS SDK. Here's the pattern:

**OLD API (React Native Firebase):**
```typescript
const doc = await firebaseFirestore
  .collection('collectionName')
  .doc('docId')
  .get();

if (doc.exists) {
  const data = doc.data();
}
```

**NEW API (Firebase JS SDK):**
```typescript
import { doc, getDoc, collection } from 'firebase/firestore';

const docRef = doc(firebaseFirestore, 'collectionName', 'docId');
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const data = docSnap.data();
}
```

**Key Changes Needed:**

1. **Reading Documents:**
   - `.collection().doc().get()` → `getDoc(doc(firestore, 'collection', 'id'))`
   - `.exists` → `.exists()`

2. **Adding Documents:**
   - `.collection().add(data)` → `addDoc(collection(firestore, 'collection'), data)`

3. **Updating Documents:**
   - `.doc().update(data)` → `updateDoc(doc(firestore, 'collection', 'id'), data)`

4. **Queries:**
   ```typescript
   // OLD
   const snapshot = await firebaseFirestore
     .collection('rides')
     .where('status', '==', 'active')
     .orderBy('createdAt', 'desc')
     .get();
   
   // NEW
   import { query, where, orderBy, getDocs } from 'firebase/firestore';
   
   const q = query(
     collection(firebaseFirestore, 'rides'),
     where('status', '==', 'active'),
     orderBy('createdAt', 'desc')
   );
   const snapshot = await getDocs(q);
   ```

5. **Real-time Listeners:**
   ```typescript
   // OLD
   const unsubscribe = firebaseFirestore
     .collection('rides')
     .doc(rideId)
     .onSnapshot((snapshot) => {
       if (snapshot.exists) {
         callback(snapshot.data());
       }
     });
   
   // NEW
   import { doc, onSnapshot } from 'firebase/firestore';
   
   const unsubscribe = onSnapshot(
     doc(firebaseFirestore, 'rides', rideId),
     (snapshot) => {
       if (snapshot.exists()) {
         callback(snapshot.data());
       }
     }
   );
   ```

6. **Batch Writes:**
   ```typescript
   // OLD
   const batch = firebaseFirestore.batch();
   batch.set(ref, data);
   await batch.commit();
   
   // NEW
   import { writeBatch, doc } from 'firebase/firestore';
   
   const batch = writeBatch(firebaseFirestore);
   batch.set(doc(firebaseFirestore, 'collection', 'id'), data);
   await batch.commit();
   ```

7. **FieldValue:**
   ```typescript
   // OLD
   import { FieldValue } from '../config/firebase';
   updatedAt: FieldValue.serverTimestamp()
   
   // NEW (already configured)
   import { FieldValue } from '../config/firebase';
   updatedAt: FieldValue.serverTimestamp()
   
   // For arrayUnion/arrayRemove:
   import { arrayUnion, arrayRemove } from 'firebase/firestore';
   timeline: arrayUnion(newItem)
   ```

### Task 2: Update Driver Service

Apply the same Firebase JS SDK patterns to `src/services/driverService.ts`.

### Task 3: Update Location Service

Replace `react-native-geolocation-service` with `expo-location`:

```bash
npx expo install expo-location
```

**Migration Pattern:**
```typescript
// OLD
import Geolocation from 'react-native-geolocation-service';

Geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords);
  },
  (error) => {
    console.error(error);
  },
  { enableHighAccuracy: true }
);

// NEW
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  throw new Error('Permission denied');
}

const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High
});
console.log(location.coords);
```

### Task 4: Update Notification Service

Install expo-notifications:
```bash
npx expo install expo-notifications
```

Update `src/services/notificationService.ts` to use Expo's notification API.

### Task 5: Phone Authentication Setup

**Option A: Use expo-firebase-recaptcha (Recommended)**

1. Install the package:
```bash
npx expo install expo-firebase-recaptcha
```

2. Update `src/services/auth.ts`:
```typescript
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

// In your component:
const recaptchaVerifier = useRef(null);

<FirebaseRecaptchaVerifierModal
  ref={recaptchaVerifier}
  firebaseConfig={firebaseConfig}
/>

// When sending OTP:
const confirmationResult = await signInWithPhoneNumber(
  firebaseAuth,
  phoneNumber,
  recaptchaVerifier.current
);
```

**Option B: Backend Implementation**

Implement phone authentication via Firebase Cloud Functions to avoid reCAPTCHA in the mobile app.

### Task 6: Add App Assets

Create the following assets in the `assets/` folder:

1. **icon.png** (1024x1024):
   ```bash
   # Using your logo.svg
   convert -background none -resize 1024x1024 logo.svg assets/icon.png
   ```

2. **splash.png** (1284x2778):
   - Create with #F59E0B background
   - Center the YellowTaxi logo

3. **adaptive-icon.png** (1024x1024):
   - Same as icon.png with padding

4. **favicon.png** (48x48):
   - Simplified logo for web

### Task 7: Install Dependencies

```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Install new dependencies
npm install

# For iOS (if building locally)
cd ios && pod install && cd ..
```

### Task 8: Test the Migration

```bash
# Start Expo
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
- [ ] Authentication flow works
- [ ] Maps display correctly
- [ ] Location services work
- [ ] Navigation flows work
- [ ] Fonts load properly

## 📝 Quick Reference

### Firebase JS SDK Imports
```typescript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
```

### Common Patterns

**Get Single Document:**
```typescript
const docRef = doc(firebaseFirestore, 'collection', 'id');
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  const data = docSnap.data();
}
```

**Get Multiple Documents:**
```typescript
const q = query(
  collection(firebaseFirestore, 'collection'),
  where('field', '==', 'value'),
  orderBy('createdAt', 'desc'),
  limit(10)
);
const querySnapshot = await getDocs(q);
querySnapshot.forEach((doc) => {
  console.log(doc.id, doc.data());
});
```

**Real-time Listener:**
```typescript
const unsubscribe = onSnapshot(
  doc(firebaseFirestore, 'collection', 'id'),
  (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  },
  (error) => {
    console.error(error);
  }
);

// Don't forget to unsubscribe
return () => unsubscribe();
```

## 🚀 Next Steps

1. **Complete Service Migrations** (1-2 hours)
   - Update rideService.ts
   - Update driverService.ts
   - Update locationService.ts
   - Update notificationService.ts

2. **Setup Phone Auth** (30 minutes)
   - Install expo-firebase-recaptcha
   - Update auth service

3. **Add Assets** (15 minutes)
   - Generate app icons
   - Create splash screen

4. **Install & Test** (30 minutes)
   - Run npm install
   - Test on Android/iOS
   - Fix any issues

**Total Estimated Time: 2-3 hours**

## 📚 Resources

- [Firebase JS SDK Docs](https://firebase.google.com/docs/web/setup)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Firebase Recaptcha](https://github.com/expo/expo/tree/main/packages/expo-firebase-recaptcha)
- [Migration Guide](./docs/EXPO_MIGRATION_GUIDE.md)

---

**Status**: Configuration complete, service migration in progress
**Branch**: `feature/migrate-to-expo`
**Last Updated**: 2025-10-04
