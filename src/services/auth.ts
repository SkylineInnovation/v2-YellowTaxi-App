// Firebase Auth Service for React Native
// Real Firebase implementation using @react-native-firebase

import { User, PhoneAuthResponse, AuthResponse } from '../types/auth';
import {
  firebaseAuth,
  firebaseFirestore,
  isFirebaseConfigured,
  type ConfirmationResult,
  type UserCredential
} from '../config/firebase';

// Firebase Auth implementation for React Native
class FirebaseAuthService {
  private currentUser: User | null = null;

  async signInWithPhoneNumber(phoneNumber: string): Promise<ConfirmationResult> {
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured');
      }

      console.log(`Sending OTP to ${phoneNumber}...`);

      // Use React Native Firebase phone authentication
      // Note: This automatically handles SMS sending without reCAPTCHA
      const confirmationResult = await firebaseAuth.signInWithPhoneNumber(phoneNumber);

      console.log('OTP sent successfully');
      return confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseAuth.signOut();
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
        phoneNumber: firebaseUser.phoneNumber,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      };
    }
    return null;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          phoneNumber: firebaseUser.phoneNumber,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
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
      const userDocRef = firebaseFirestore.collection('users').doc(user.uid);

      const userData = {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
        ...additionalData,
      };

      // Check if user document exists
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        // Create new user document
        await userDocRef.set({
          ...userData,
          createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
        });
        console.log('User document created');
      } else {
        // Update existing user document
        await userDocRef.update(userData);
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

  async sendOTP(phoneNumber: string): Promise<PhoneAuthResponse> {
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured. Please check your Firebase setup.');
      }

      // Format phone number to E.164 format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      console.log('Sending OTP to:', formattedPhone);

      // Send OTP using Firebase Auth
      const confirmationResult = await auth.signInWithPhoneNumber(formattedPhone);

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
      if (result.user) {
        const user: User = {
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
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

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Add Jordan country code if not present (default country)
    if (!cleaned.startsWith('962')) {
      return `+962${cleaned}`;
    }

    return `+${cleaned}`;
  }

  validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if it's a valid Jordanian phone number (9 digits after country code)
    if (cleaned.startsWith('962')) {
      return cleaned.length === 12; // 962 + 9 digits
    }

    // For other countries, basic validation (at least 7 digits)
    return cleaned.length >= 7 && cleaned.length <= 15;
  }

  formatDisplayPhoneNumber(phone: string, countryCode: string = '+962'): string {
    const cleaned = phone.replace(/\D/g, '');

    if (countryCode === '+962' && cleaned.length === 9) {
      // Format Jordanian numbers: XXX XXX XXX
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    return phone;
  }

  // Additional utility methods for user management
  async updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    try {
      const userDocRef = firebaseFirestore.collection('users').doc(uid);
      await userDocRef.update({
        ...profileData,
        updatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
      });
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<any> {
    try {
      const userDocRef = firebaseFirestore.collection('users').doc(uid);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
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
