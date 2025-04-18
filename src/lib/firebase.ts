import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage"; // Import storage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
// Check if Firebase app already exists to avoid reinitialization (common in Next.js HMR)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp(); // Export app

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize storage

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Check if emulators are already connected (optional, prevents errors during HMR)
  // Note: Firebase JS SDK v9+ might handle this internally, but explicit checks can be safer.
  // We'll assume for now the SDK handles it or HMR restarts cleanly.
  try {
    console.log("Connecting to Firebase emulators...");
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    console.log("Connected to Firebase emulators.");
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
    // Potentially already connected, ignore if needed, or handle specific errors
  }
}
