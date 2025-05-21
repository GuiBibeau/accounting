import * as functions from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';

// Assuming admin.initializeApp() is called in functions/src/index.ts or handled by v2 SDK
// If not, it might need to be initialized here or in index.ts explicitly.
// For safety, ensure it's initialized before db is used.
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

import { syncYoutubeDataForCloudFunction } from '../lib/youtube-cf';

// Define function options, can be adjusted as needed
const functionOptions: functions.tasks.TaskQueueOptions &
  functions.GlobalOptions = {
  region: 'us-central1', // Or your preferred region
  memory: '512MiB', // Adjust based on expected workload
  timeoutSeconds: 540, // Max timeout for event-driven functions
};

export const onYoutubeIntegrationWrite = functions.firestore.onDocumentWritten(
  { document: 'users/{userId}/integrations/youtube', ...functionOptions },
  async (event) => {
    const userId = event.params.userId;
    logger.info(
      `Firestore event for 'users/${userId}/integrations/youtube'. Event ID: ${event.id}`
    );

    const snapshot = event.data;
    if (!snapshot) {
      logger.info(
        `No data associated with the event for 'users/${userId}/integrations/youtube'. This might be a deletion.`
      );
      return null;
    }

    const afterData = snapshot.after.data();

    if (!snapshot.after.exists) {
      logger.info(
        `YouTube integration for user ${userId} was deleted. No sync action taken.`
      );
      return null;
    }

    // Check for essential data in the new/updated document
    if (!afterData || !afterData.encryptedAccessToken) {
      logger.warn(
        `YouTube integration for user ${userId} is missing an access token after write. Sync skipped.`
      );
      return null;
    }

    if (snapshot.before.exists) {
      logger.info(
        `YouTube integration for user ${userId} was updated. Triggering sync.`
      );
    } else {
      logger.info(
        `New YouTube integration created for user ${userId}. Triggering sync.`
      );
    }

    try {
      // Pass the Firestore instance from the Cloud Function's admin SDK
      const syncResult = await syncYoutubeDataForCloudFunction(userId, db);
      if (syncResult.success) {
        logger.info(
          `Successfully completed YouTube data sync for user ${userId} (Channel ID: ${syncResult.channelId || 'N/A'}) via Firestore trigger.`
        );
      } else {
        logger.warn(
          `YouTube data sync for user ${userId} did not fully complete: ${syncResult.message || 'No specific message.'} (Firestore trigger)`
        );
      }
    } catch (error) {
      logger.error(
        `Error during YouTube data sync for user ${userId} via Firestore trigger:`,
        error
      );
      // Rethrow the error to signal failure to Firebase, which might trigger retries
      // depending on your function's configuration and the nature of the error.
      // Be cautious with retries for long-running or stateful operations.
      throw error;
    }
    return null;
  }
);
