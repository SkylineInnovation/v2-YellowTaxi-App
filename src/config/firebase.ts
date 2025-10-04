// Firebase configuration for Expo
// This uses the Firebase JS SDK (v10) which is compatible with Expo

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  initializeAuth,
  browserLocalPersistence,
  User,
  UserCredential,
  ConfirmationResult
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  serverTimestamp,
  DocumentSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Configuration extracted from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBV99Kd9kmI7p_E11HG_lC4vIKPvjqKZ_I",
  authDomain: "yellowtaxi-rides.firebaseapp.com",
  projectId: "yellowtaxi-rides",
  storageBucket: "yellowtaxi-rides.firebasestorage.app",
  messagingSenderId: "926847755164",
  appId: "1:926847755164:android:bc7677ccd2366aed529e59"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    
    // Initialize Auth with AsyncStorage persistence for React Native
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
    
    firestore = getFirestore(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Export Firebase services
export const firebaseAuth = auth;
export const firebaseFirestore = firestore;
export const firebaseApp = app;

// Export FieldValue for serverTimestamp and other field operations
export const FieldValue = {
  serverTimestamp: serverTimestamp
};

// Export types for TypeScript
export type { User, UserCredential, ConfirmationResult, DocumentSnapshot, QuerySnapshot };

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  try {
    return !!(firebaseAuth && firebaseFirestore && firebaseApp);
  } catch (error) {
    console.warn('Firebase configuration check failed:', error);
    return false;
  }
};

// Debug Firebase configuration (development only)
if (__DEV__) {
  try {
    console.log('🔥 Firebase Expo Configuration Status:', {
      isConfigured: isFirebaseConfigured(),
      hasAuth: !!firebaseAuth,
      hasFirestore: !!firebaseFirestore,
      hasApp: !!firebaseApp,
      authCurrentUser: firebaseAuth.currentUser?.uid || 'No user',
    });
  } catch (error) {
    console.warn('Firebase debug info failed:', error);
  }
}
