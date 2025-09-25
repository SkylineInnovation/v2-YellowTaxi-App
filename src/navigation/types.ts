import { NavigatorScreenParams } from '@react-navigation/native';
import { User, UserRole } from '../types/auth';

// Auth Stack
export type AuthStackParamList = {
  LanguageSelection: undefined;
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

// Main App Stack (after authentication)
export type AppStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList>;
  DriverTabs: NavigatorScreenParams<DriverTabParamList>;
  AdminTabs: NavigatorScreenParams<AdminTabParamList>;
};

// Customer Tab Navigator
export type CustomerTabParamList = {
  RideBooking: undefined;
  BookRide: undefined;
  EnhancedRideBooking: undefined;
  RideTracking: undefined;
  EnhancedRideTracking: undefined;
  DriverDashboard: undefined;
  BecomeDriver: undefined;
  RideHistory: undefined;
  Profile: undefined;
};

// Driver Tab Navigator
export type DriverTabParamList = {
  Dashboard: undefined;
  Earnings: undefined;
  Profile: undefined;
};

// Admin Tab Navigator
export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Analytics: undefined;
  Profile: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
  Splash: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
