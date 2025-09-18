// Firebase Auth Service
// Note: This is a mock implementation for demonstration purposes
// In a real app, you would import and configure Firebase Auth

import { User, PhoneAuthResponse, AuthResponse } from '../types/auth';

// Mock Firebase Auth types
interface ConfirmationResult {
  verificationId: string;
  confirm: (verificationCode: string) => Promise<UserCredential>;
}

interface UserCredential {
  user: User;
}

// Mock Firebase Auth implementation
class MockFirebaseAuth {
  private currentUser: User | null = null;
  private mockVerificationId: string | null = null;

  async signInWithPhoneNumber(phoneNumber: string): Promise<ConfirmationResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock verification ID
    this.mockVerificationId = `mock_verification_${Date.now()}`;

    console.log(`Mock OTP sent to ${phoneNumber}: 123456`);

    return {
      verificationId: this.mockVerificationId,
      confirm: async (verificationCode: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (verificationCode === '123456') {
          const user: User = {
            uid: `user_${Date.now()}`,
            phoneNumber,
            displayName: null,
            email: null,
            photoURL: null,
          };
          
          this.currentUser = user;
          return { user };
        } else {
          throw new Error('Invalid verification code');
        }
      },
    };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.mockVerificationId = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    // Simulate auth state listener
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      // Cleanup listener
    };
  }
}

// Create mock auth instance
const auth = new MockFirebaseAuth();

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
      // Format phone number to E.164 format
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      console.log('Sending OTP to:', formattedPhone);

      // Send OTP using mock Firebase Auth
      const confirmationResult = await auth.signInWithPhoneNumber(formattedPhone);

      return {
        success: true,
        confirmationResult,
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP. Please try again.',
      };
    }
  }

  async verifyOTP(confirmationResult: ConfirmationResult, otp: string): Promise<AuthResponse> {
    try {
      const result = await confirmationResult.confirm(otp);
      
      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid OTP. Please check and try again.',
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

    // Add Jordan country code if not present
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
}

export const phoneAuthService = PhoneAuthService.getInstance();
