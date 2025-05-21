import * as admin from 'firebase-admin';

admin.initializeApp();

export { onVideoCreated } from './firestore/onVideoCreated';
export { onAudioReadyForTranscription } from './firestore/onAudioReadyForTranscription';
export { onYoutubeIntegrationWrite } from './firestore/onYoutubeIntegrationWrite';
