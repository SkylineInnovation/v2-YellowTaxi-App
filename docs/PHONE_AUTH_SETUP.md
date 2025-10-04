# Phone Authentication Setup with Expo

## Overview
The YellowTaxi app now uses `expo-firebase-recaptcha` for phone authentication with Firebase JS SDK. This provides a secure way to verify phone numbers without requiring native Firebase modules.

## What Was Implemented

### 1. **FirebaseRecaptcha Component** ✅
Created `/src/components/auth/FirebaseRecaptcha.tsx`:
- Wraps `FirebaseRecaptchaVerifierModal` from expo-firebase-recaptcha
- Configured for invisible verification (better UX)
- Handles Android hardware acceleration issues
- Provides proper Firebase config integration

### 2. **Updated Auth Service** ✅
Modified `/src/services/auth.ts`:
- `signInWithPhoneNumber()` now requires recaptcha verifier parameter
- `sendOTP()` accepts optional recaptcha verifier
- Added proper error handling for captcha failures
- Removed old React Native Firebase dependencies

### 3. **Dependencies Installed** ✅
- ✅ `expo-firebase-recaptcha` - Recaptcha verification for phone auth
- ✅ Removed `@react-native-firebase/*` packages (no longer needed)
- ✅ Removed `@react-native-google-signin/google-signin` (not needed for Expo)

## How to Use in Your Screens

### Step 1: Import Required Components
```typescript
import React, { useRef } from 'react';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseApp } from '../config/firebase';
import { phoneAuthService } from '../services/auth';
```

### Step 2: Create Recaptcha Ref
```typescript
const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
```

### Step 3: Add Recaptcha Component to Your Screen
```typescript
<FirebaseRecaptchaVerifierModal
  ref={recaptchaVerifier}
  firebaseConfig={firebaseApp.options}
  attemptInvisibleVerification={true}
/>
```

### Step 4: Send OTP with Recaptcha
```typescript
const handleSendOTP = async () => {
  try {
    const result = await phoneAuthService.sendOTP(
      phoneNumber,
      dialCode,
      recaptchaVerifier.current
    );
    
    if (result.success) {
      // OTP sent successfully
      setConfirmationResult(result.confirmationResult);
    } else {
      // Handle error
      Alert.alert('Error', result.error);
    }
  } catch (error) {
    console.error('OTP error:', error);
  }
};
```

### Step 5: Verify OTP
```typescript
const handleVerifyOTP = async () => {
  try {
    const result = await phoneAuthService.verifyOTP(
      confirmationResult,
      otpCode
    );
    
    if (result.success) {
      // User authenticated successfully
      navigation.navigate('Home');
    } else {
      // Handle error
      Alert.alert('Error', result.error);
    }
  } catch (error) {
    console.error('Verification error:', error);
  }
};
```

## Example: Complete PhoneLoginScreen

```typescript
import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseApp } from '../config/firebase';
import { phoneAuthService } from '../services/auth';

export const PhoneLoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  const handleSendOTP = async () => {
    const result = await phoneAuthService.sendOTP(
      phoneNumber,
      '+962',
      recaptchaVerifier.current
    );
    
    if (result.success) {
      setConfirmationResult(result.confirmationResult);
      Alert.alert('Success', 'OTP sent to your phone');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleVerifyOTP = async () => {
    const result = await phoneAuthService.verifyOTP(
      confirmationResult,
      otpCode
    );
    
    if (result.success) {
      // Navigate to home
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseApp.options}
        attemptInvisibleVerification={true}
      />
      
      <TextInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone Number"
      />
      
      <TouchableOpacity onPress={handleSendOTP}>
        <Text>Send OTP</Text>
      </TouchableOpacity>
      
      {confirmationResult && (
        <>
          <TextInput
            value={otpCode}
            onChangeText={setOtpCode}
            placeholder="Enter OTP"
          />
          
          <TouchableOpacity onPress={handleVerifyOTP}>
            <Text>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
```

## Important Notes

### 1. **Recaptcha Visibility**
- `attemptInvisibleVerification={true}` - Tries to verify without showing UI
- If invisible verification fails, a modal will appear for user interaction
- This provides the best user experience

### 2. **Android Configuration**
The recaptcha component includes Android-specific optimizations:
```typescript
androidHardwareAccelerationDisabled={false}
androidLayerType="software"
```

### 3. **Error Handling**
The auth service handles common errors:
- `auth/invalid-phone-number` - Invalid phone format
- `auth/too-many-requests` - Rate limiting
- `auth/quota-exceeded` - SMS quota exceeded
- `auth/captcha` - Captcha verification failed

### 4. **Test Phone Numbers**
For development, you can configure test phone numbers in Firebase Console:
1. Go to Firebase Console → Authentication → Sign-in method
2. Click on Phone → Phone numbers for testing
3. Add test numbers with verification codes

Example:
- Phone: +1 650-555-3434
- Code: 123456

## Troubleshooting

### Issue: "Recaptcha verifier is required"
**Solution**: Ensure the recaptcha component is rendered and the ref is passed to sendOTP()

### Issue: Recaptcha modal not appearing
**Solution**: Check that `firebaseConfig` is correctly passed to the component

### Issue: "auth/captcha-check-failed"
**Solution**: 
- Ensure Firebase project has Phone authentication enabled
- Check that SHA-256 fingerprint is added for Android (for production)
- Verify app is authorized in Firebase Console

### Issue: OTP not received
**Solution**:
- Check Firebase Console for SMS quota
- Verify phone number format (E.164: +[country code][number])
- Check Firebase project billing is enabled

## Next Steps

1. **Update PhoneLoginScreen** to use the new recaptcha component
2. **Test phone authentication** with test numbers
3. **Configure production** SHA-256 fingerprints for Android
4. **Enable billing** in Firebase for production SMS

## Resources

- [Expo Firebase Recaptcha Docs](https://github.com/expo/expo/tree/main/packages/expo-firebase-recaptcha)
- [Firebase Phone Auth Docs](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Test Phone Numbers](https://firebase.google.com/docs/auth/web/phone-auth#test-with-fictional-phone-numbers)

---

**Status**: ✅ Phone authentication setup complete
**Branch**: `feature/migrate-to-expo`
**Last Updated**: 2025-10-04
