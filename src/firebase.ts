import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable Offline Persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.warn('Firestore Persistence failed-precondition: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firestore Persistence unimplemented: Browser not supported');
    }
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    tenantId: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Construct a safe, flat error object
  const errInfo = {
    error: errorMessage,
    operationType,
    path,
    uid: auth.currentUser?.uid || 'anonymous',
    timestamp: new Date().toISOString()
  };

  // Use a safe logging approach
  console.group('🔥 Firestore Error');
  console.error('Operation:', operationType);
  console.error('Path:', path);
  console.error('Message:', errorMessage);
  console.groupEnd();

  // Throw a simple stringified version that we know is safe
  throw new Error(JSON.stringify(errInfo));
}
