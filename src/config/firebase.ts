// Firebase configuration for React Native
// This uses the same Firebase project as the web application

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// Firebase services - automatically initialized from config files
// google-services.json (Android) and GoogleService-Info.plist (iOS)
export const firebaseAuth = auth();
export const firebaseFirestore = firestore();

// Export types for TypeScript
export type User = FirebaseAuthTypes.User;
export type UserCredential = FirebaseAuthTypes.UserCredential;
export type ConfirmationResult = FirebaseAuthTypes.ConfirmationResult;
export type DocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type QuerySnapshot = FirebaseFirestoreTypes.QuerySnapshot;

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  try {
    // Check if Firebase services are available
    // In React Native Firebase, services are automatically initialized
    // if the config files are present
    return !!(firebaseAuth && firebaseFirestore);
  } catch (error) {
    console.warn('Firebase configuration check failed:', error);
    return false;
  }
};

// Debug Firebase configuration (development only)
if (__DEV__) {
  try {
    console.log('🔥 Firebase React Native Configuration Status:', {
      isConfigured: isFirebaseConfigured(),
      hasAuth: !!firebaseAuth,
      hasFirestore: !!firebaseFirestore,
      authCurrentUser: firebaseAuth.currentUser?.uid || 'No user',
    });
  } catch (error) {
    console.warn('Firebase debug info failed:', error);
  }
}
