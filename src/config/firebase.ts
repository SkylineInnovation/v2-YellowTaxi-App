// Firebase configuration for Expo
// This uses the Firebase JS SDK (v10) which is compatible with Expo

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
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

// Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
// You can find this in Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  } else {
    app = getApp();
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
