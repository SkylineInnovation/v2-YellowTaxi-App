// Firebase Auth Service for Expo
// Firebase JS SDK implementation

import { User, PhoneAuthResponse, AuthResponse } from '../types/auth';
import {
  firebaseAuth,
  firebaseFirestore,
  isFirebaseConfigured,
  FieldValue,
  type ConfirmationResult,
  type UserCredential
} from '../config/firebase';
import {
  validatePhoneNumber as validatePhone,
  formatPhoneNumber as formatPhone,
  formatDisplayPhoneNumber,
  isValidPhoneForCountry,
  extractDialCode
} from '../utils/phoneValidation';
import { 
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  RecaptchaVerifier
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection 
} from 'firebase/firestore';

// Firebase Auth implementation for Expo
class FirebaseAuthService {
  private currentUser: User | null = null;

  async signInWithPhoneNumber(
    phoneNumber: string, 
    recaptchaVerifier: any
  ): Promise<ConfirmationResult> {
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured');
      }

      if (!recaptchaVerifier) {
        throw new Error('Recaptcha verifier is required for phone authentication');
      }

      console.log(`Sending OTP to ${phoneNumber}...`);

      // Use Firebase JS SDK with expo-firebase-recaptcha
      const confirmationResult = await firebaseSignInWithPhoneNumber(
        firebaseAuth, 
        phoneNumber,
        recaptchaVerifier
      );

      console.log('OTP sent successfully');
      return confirmationResult as ConfirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(firebaseAuth);
      this.currentUser = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    const firebaseUser = firebaseAuth.currentUser;
    if (firebaseUser) {
      return {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber || '',
        displayName: firebaseUser.displayName || undefined,
        email: firebaseUser.email || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      };
    }
    return null;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber || '',
          displayName: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        };
        this.currentUser = user;
        callback(user);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  // Create or update user document in Firestore
  async createOrUpdateUserDocument(user: User, additionalData?: any): Promise<void> {
    try {
      const userDocRef = doc(firebaseFirestore, 'users', user.uid);

      // Build user data object, filtering out undefined values
      const userData: any = {
        uid: user.uid,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // Only add fields that are not undefined
      if (user.phoneNumber) userData.phoneNumber = user.phoneNumber;
      if (user.displayName) userData.displayName = user.displayName;
      if (user.email) userData.email = user.email;
      if (user.photoURL) userData.photoURL = user.photoURL;

      // Add additional data if provided
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          if (additionalData[key] !== undefined) {
            userData[key] = additionalData[key];
          }
        });
      }

      // Check if user document exists
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          ...userData,
          createdAt: FieldValue.serverTimestamp(),
        });
        console.log('User document created');
      } else {
        // Update existing user document
        await updateDoc(userDocRef, userData);
        console.log('User document updated');
      }
    } catch (error) {
      console.error('Error creating/updating user document:', error);
      throw error;
    }
  }
}

// Create Firebase auth instance
const auth = new FirebaseAuthService();

export class PhoneAuthService {
  private static instance: PhoneAuthService;

  static getInstance(): PhoneAuthService {
    if (!PhoneAuthService.instance) {
      PhoneAuthService.instance = new PhoneAuthService();
    }
    return PhoneAuthService.instance;
  }

  async sendOTP(
    phoneNumber: string, 
    dialCode: string = '+962',
    recaptchaVerifier?: any
  ): Promise<PhoneAuthResponse> {
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured. Please check your Firebase setup.');
      }

      if (!recaptchaVerifier) {
        throw new Error('Recaptcha verifier is required. Please ensure the recaptcha component is loaded.');
      }

      // Validate phone number first
      if (!this.validatePhoneNumber(phoneNumber, dialCode)) {
        throw new Error('Invalid phone number format. Please enter a valid phone number.');
      }

      // Format phone number to E.164 format
      const formattedPhone = this.formatPhoneNumber(phoneNumber, dialCode);

      console.log('Sending OTP to:', formattedPhone);

      // Send OTP using Firebase Auth with recaptcha verifier
      const confirmationResult = await auth.signInWithPhoneNumber(formattedPhone, recaptchaVerifier);

      return {
        success: true,
        confirmationResult,
      };
    } catch (error) {
      console.error('Send OTP error:', error);

      let errorMessage = 'Failed to send OTP. Please try again.';

      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes('auth/invalid-phone-number')) {
          errorMessage = 'Invalid phone number format. Please enter a valid phone number.';
        } else if (error.message.includes('auth/too-many-requests')) {
          errorMessage = 'Too many requests. Please try again later.';
        } else if (error.message.includes('auth/quota-exceeded')) {
          errorMessage = 'SMS quota exceeded. Please try again later.';
        } else if (error.message.includes('auth/captcha')) {
          errorMessage = 'Captcha verification failed. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async verifyOTP(confirmationResult: ConfirmationResult, otp: string): Promise<AuthResponse> {
    try {
      const result = await confirmationResult.confirm(otp);

      // Create or update user document in Firestore
      if (result?.user) {
        const user: User = {
          uid: result.user.uid,
          id: result.user.uid,
          phoneNumber: result.user.phoneNumber || '',
          displayName: result.user.displayName || undefined,
          email: result.user.email || undefined,
          photoURL: result.user.photoURL || undefined,
        };

        // Create/update user document
        await auth.createOrUpdateUserDocument(user);

        return {
          success: true,
          user,
        };
      } else {
        throw new Error('Authentication failed - no user returned');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);

      let errorMessage = 'Invalid OTP. Please check and try again.';

      if (error instanceof Error) {
        // Handle specific Firebase errors
        if (error.message.includes('auth/invalid-verification-code')) {
          errorMessage = 'Invalid verification code. Please check the code and try again.';
        } else if (error.message.includes('auth/code-expired')) {
          errorMessage = 'Verification code has expired. Please request a new code.';
        } else if (error.message.includes('auth/session-expired')) {
          errorMessage = 'Session has expired. Please start the verification process again.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return auth.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth.onAuthStateChanged(callback);
  }

  private formatPhoneNumber(phone: string, dialCode: string = '+962'): string {
    // Use the comprehensive phone formatting utility
    return formatPhone(phone, dialCode);
  }

  validatePhoneNumber(phone: string, dialCode?: string): boolean {
    // Use the comprehensive phone validation utility
    return validatePhone(phone, dialCode);
  }

  formatDisplayPhoneNumber(phone: string, dialCode: string = '+962'): string {
    // Use the comprehensive phone display formatting utility
    return formatDisplayPhoneNumber(phone, dialCode);
  }

  // Additional utility methods for user management
  async updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    try {
      const userDocRef = doc(firebaseFirestore, 'users', uid);
      await updateDoc(userDocRef, {
        ...profileData,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<any> {
    try {
      const userDocRef = doc(firebaseFirestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
}

export const phoneAuthService = PhoneAuthService.getInstance();
