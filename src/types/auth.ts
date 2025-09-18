// Authentication related types
export interface User {
  uid: string;
  phoneNumber: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  roles: UserRole[];
  profile: CustomerProfile | DriverProfile;
  settings: UserSettings;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
  };
}

export type UserRole = 'customer' | 'driver' | 'admin';

export interface CustomerProfile {
  preferredPaymentMethod?: string;
  savedAddresses: SavedAddress[];
  rideHistory: string[];
}

export interface DriverProfile {
  licenseNumber: string;
  licenseExpiry: Date;
  vehicle: VehicleInfo;
  documentsVerified: boolean;
  rating: number;
  totalRides: number;
  status: DriverStatus;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  type: 'sedan' | 'suv' | 'hatchback' | 'van';
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface UserSettings {
  notifications: {
    push: boolean;
    sms: boolean;
    email: boolean;
  };
  language: string;
  theme: 'light' | 'dark' | 'auto';
  fcmToken?: string;
  lastTokenUpdate?: Date;
}

export type DriverStatus = 'offline' | 'online' | 'busy' | 'inactive';

// Authentication state types
export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  phoneVerification: {
    phoneNumber: string | null;
    confirmationResult: any | null;
    loading: boolean;
    error: string | null;
  };
}

// Form types
export interface PhoneLoginForm {
  phoneNumber: string;
  countryCode: string;
}

export interface OTPVerificationForm {
  otp: string;
}

export interface RoleSelectionForm {
  selectedRoles: UserRole[];
}

export interface ProfileSetupForm {
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  // Driver specific fields
  licenseNumber?: string;
  licenseExpiry?: Date;
  vehicle?: Partial<VehicleInfo>;
}

// API response types
export interface AuthResponse {
  success: boolean;
  user?: User;
  userProfile?: UserProfile;
  error?: string;
}

export interface PhoneAuthResponse {
  success: boolean;
  confirmationResult?: any;
  error?: string;
}

// Navigation types
export type AuthStackParamList = {
  PhoneLogin: undefined;
  OTPVerification: {
    phoneNumber: string;
    confirmationResult: any;
  };
  RoleSelection: {
    user: User;
  };
  ProfileSetup: {
    user: User;
    selectedRoles: UserRole[];
  };
};

// Country code type
export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}
