# Firebase React Native Setup Guide

This guide will help you configure Firebase for the React Native mobile app to use the same Firebase project as the web application.

## Prerequisites

- Firebase project already set up for the web application
- React Native development environment configured
- Access to Firebase Console

## Step 1: Add Mobile Apps to Firebase Project

### 1.1 Add Android App

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your existing YellowTaxi project
3. Click "Add app" and select Android
4. Enter the following details:
   - **Android package name**: `com.yellowtaxiapp` (from `android/app/build.gradle`)
   - **App nickname**: `YellowTaxi Android`
   - **Debug signing certificate SHA-1**: (optional for development)

5. Download the `google-services.json` file
6. Place it in `android/app/google-services.json`

### 1.2 Add iOS App

1. In the same Firebase project, click "Add app" and select iOS
2. Enter the following details:
   - **iOS bundle ID**: `com.yellowtaxiapp` (from `ios/yellowtaxiapp/Info.plist`)
   - **App nickname**: `YellowTaxi iOS`
   - **App Store ID**: (leave empty for development)

3. Download the `GoogleService-Info.plist` file
4. Place it in `ios/yellowtaxiapp/GoogleService-Info.plist`

## Step 2: Configure Android

### 2.1 Update `android/build.gradle`

Add the Google Services plugin:

```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 2.2 Update `android/app/build.gradle`

Add at the bottom of the file:

```gradle
apply plugin: 'com.google.gms.google-services'
```

## Step 3: Configure iOS

### 3.1 Add GoogleService-Info.plist to Xcode

1. Open `ios/yellowtaxiapp.xcworkspace` in Xcode
2. Right-click on the project in the navigator
3. Select "Add Files to 'yellowtaxiapp'"
4. Navigate to and select `GoogleService-Info.plist`
5. Make sure "Copy items if needed" is checked
6. Make sure the target is selected

### 3.2 Update iOS Podfile

The Podfile should already be configured correctly with the Firebase dependencies.

## Step 4: Install iOS Dependencies

```bash
cd ios
pod install
cd ..
```

## Step 5: Enable Phone Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable "Phone" authentication
3. Add your test phone numbers if needed (for development)

## Step 6: Update Firebase Configuration

Update `src/config/firebase.ts` with your actual Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: 'your-actual-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-actual-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: 'your-actual-sender-id',
  appId: 'your-actual-app-id',
};
```

## Step 7: Test the Setup

1. Build and run the app:
   ```bash
   # For Android
   npx react-native run-android
   
   # For iOS
   npx react-native run-ios
   ```

2. Test phone authentication flow
3. Check Firebase Console > Authentication > Users to see if users are created

## Troubleshooting

### Common Issues

1. **"Firebase not configured" error**
   - Ensure `google-services.json` and `GoogleService-Info.plist` are in the correct locations
   - Rebuild the app after adding configuration files

2. **Phone authentication not working**
   - Check that Phone authentication is enabled in Firebase Console
   - Verify the phone number format (should be in E.164 format)
   - Check Firebase Console logs for errors

3. **iOS build errors**
   - Run `cd ios && pod install` after adding Firebase dependencies
   - Clean and rebuild the project

4. **Android build errors**
   - Ensure Google Services plugin is properly applied
   - Check that `google-services.json` is in `android/app/` directory

### Testing Phone Authentication

For development, you can add test phone numbers in Firebase Console:
1. Go to Authentication > Sign-in method > Phone
2. Scroll down to "Phone numbers for testing"
3. Add test numbers with verification codes

## Security Notes

- Never commit `google-services.json` or `GoogleService-Info.plist` to version control if they contain production keys
- Use different Firebase projects for development and production
- Enable App Check for production to prevent abuse

## Next Steps

After completing this setup:
1. Test the complete authentication flow
2. Verify user data is being stored in Firestore
3. Test on both iOS and Android devices
4. Set up proper error handling and user feedback
