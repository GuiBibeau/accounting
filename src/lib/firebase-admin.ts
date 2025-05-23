import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Check if running in development and if emulator host is set
const isDevelopment = process.env.NODE_ENV === 'development';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

if (isDevelopment && emulatorHost) {
  console.log(
    `Firebase Admin SDK detected FIRESTORE_EMULATOR_HOST=${emulatorHost}. Connecting to Firestore emulator.`
  );
} else if (isDevelopment) {
  console.warn(
    'Firebase Admin SDK running in development, but FIRESTORE_EMULATOR_HOST is not set. Connecting to PRODUCTION Firestore.'
  );
} else {
  console.log('Firebase Admin SDK connecting to PRODUCTION Firestore.');
}

// Initialize Firebase Admin (SDK automatically uses FIRESTORE_EMULATOR_HOST if set)
const adminApp =
  getApps()[0] ||
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
  });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
