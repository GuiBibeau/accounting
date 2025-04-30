import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (only once)
admin.initializeApp();

// Import and re-export functions from their specific files
export { onVideoCreated } from "./firestore/onVideoCreated";

// Future functions will be exported similarly:
// export { transcribeAudio } from "./storage/transcribeAudio";
// export { rotateTokens } from "./scheduled/rotateTokens";
