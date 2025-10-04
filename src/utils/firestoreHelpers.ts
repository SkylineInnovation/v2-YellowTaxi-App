// Firestore helper utilities for Firebase JS SDK (Expo compatible)
// This file provides helper functions to work with Firestore using the modular Firebase JS SDK

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  DocumentReference,
  CollectionReference,
  Query,
  Unsubscribe,
} from 'firebase/firestore';
import { firebaseFirestore } from '../config/firebase';

/**
 * Get a document reference
 */
export const getDocRef = (collectionPath: string, docId: string): DocumentReference => {
  return doc(firebaseFirestore, collectionPath, docId);
};

/**
 * Get a collection reference
 */
export const getCollectionRef = (collectionPath: string): CollectionReference => {
  return collection(firebaseFirestore, collectionPath);
};

/**
 * Get a single document
 */
export const getDocument = async (collectionPath: string, docId: string) => {
  const docRef = getDocRef(collectionPath, docId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

/**
 * Get all documents from a collection
 */
export const getDocuments = async (collectionPath: string) => {
  const collectionRef = getCollectionRef(collectionPath);
  const querySnapshot = await getDocs(collectionRef);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Query documents with filters
 */
export const queryDocuments = async (
  collectionPath: string,
  constraints: QueryConstraint[]
) => {
  const collectionRef = getCollectionRef(collectionPath);
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Subscribe to real-time updates for a document
 */
export const subscribeToDocument = (
  collectionPath: string,
  docId: string,
  callback: (data: any) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  const docRef = getDocRef(collectionPath, docId);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      } else {
        console.error('Document subscription error:', error);
      }
    }
  );
};

/**
 * Subscribe to real-time updates for a query
 */
export const subscribeToQuery = (
  collectionPath: string,
  constraints: QueryConstraint[],
  callback: (data: any[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe => {
  const collectionRef = getCollectionRef(collectionPath);
  const q = query(collectionRef, ...constraints);
  
  return onSnapshot(
    q,
    (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(docs);
    },
    (error) => {
      if (errorCallback) {
        errorCallback(error);
      } else {
        console.error('Query subscription error:', error);
      }
    }
  );
};

/**
 * Set a document (create or overwrite)
 */
export const setDocument = async (
  collectionPath: string,
  docId: string,
  data: DocumentData
) => {
  const docRef = getDocRef(collectionPath, docId);
  await setDoc(docRef, data);
};

/**
 * Update a document
 */
export const updateDocument = async (
  collectionPath: string,
  docId: string,
  data: Partial<DocumentData>
) => {
  const docRef = getDocRef(collectionPath, docId);
  await updateDoc(docRef, data);
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  collectionPath: string,
  docId: string
) => {
  const docRef = getDocRef(collectionPath, docId);
  await deleteDoc(docRef);
};

// Re-export commonly used Firestore functions for convenience
export { where, orderBy, limit, query };
