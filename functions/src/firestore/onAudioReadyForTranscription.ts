import * as functions from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import Groq from 'groq-sdk';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { defineSecret } from 'firebase-functions/params';

if (process.env.FUNCTIONS_EMULATOR === 'true') {
  dotenv.config();
  logger.info('Running in emulator, loaded .env file.');
}

const db = admin.firestore();
const storage = new Storage();

let groq: Groq | null = null;
try {
  const apiKey =
    process.env.FUNCTIONS_EMULATOR === 'true'
      ? process.env.GROQ_API_KEY
      : defineSecret('GROQ_API_KEY');

  if (!apiKey) {
    logger.error(
      'Groq API key is not set. Checked process.env.GROQ_API_KEY (for emulator) and functions.config().groq.api_key (for deployment).'
    );
  } else {
    groq = new Groq({ apiKey: String(apiKey) });
    logger.info('Groq client initialized successfully.');
  }
} catch (error) {
  logger.error('Failed to initialize Groq client:', error);
}

const functionOptions: functions.tasks.TaskQueueOptions &
  functions.GlobalOptions = {
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 540,
};

/**
 * Represents the expected data structure in the Firestore 'videos' document.
 * Includes fields relevant to this function.
 */
type VideoData = {
  userId: string;
  audioStoragePath?: string;
  audioProcessingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  transcript?: string;
};

/**
 * Triggered when a video document is updated in Firestore.
 * If audio processing is complete, downloads the audio, sends it to Groq Whisper for transcription,
 * and saves the transcript back to the Firestore document.
 */
export const onAudioReadyForTranscription =
  functions.firestore.onDocumentUpdated(
    { document: 'videos/{videoId}', ...functionOptions },
    async (event) => {
      if (!groq) {
        logger.error(
          'Groq client is not initialized. Cannot proceed with transcription.'
        );
        return;
      }

      const videoId = event.params.videoId;
      logger.info(`Function triggered for video update: ${videoId}`);

      const snapshot = event.data;
      if (!snapshot) {
        logger.error(`No data associated with the event for video: ${videoId}`);
        return;
      }

      const beforeData = snapshot.before.data() as VideoData;
      const afterData = snapshot.after.data() as VideoData;

      const audioJustCompleted =
        beforeData.audioProcessingStatus !== 'completed' &&
        afterData.audioProcessingStatus === 'completed';
      const audioPathExists = !!afterData.audioStoragePath;
      const needsTranscription =
        afterData.transcriptionStatus !== 'completed' &&
        afterData.transcriptionStatus !== 'processing';

      if (!audioJustCompleted || !audioPathExists || !needsTranscription) {
        logger.info(
          `Skipping transcription for video ${videoId}. Conditions not met:`,
          {
            audioJustCompleted,
            audioPathExists,
            needsTranscription,
            audioStatusBefore: beforeData.audioProcessingStatus,
            audioStatusAfter: afterData.audioProcessingStatus,
            transcriptionStatus: afterData.transcriptionStatus,
          }
        );
        return;
      }

      logger.info(
        `Conditions met. Starting transcription process for video: ${videoId}`
      );

      const audioFilePath = afterData.audioStoragePath!;
      const videoRef = db.collection('videos').doc(videoId);

      try {
        await videoRef.update({ transcriptionStatus: 'processing' });
        logger.info(
          `Set transcriptionStatus to 'processing' for video: ${videoId}`
        );
      } catch (error) {
        logger.error(
          `Failed to update transcriptionStatus to 'processing' for video: ${videoId}`,
          error
        );
        return;
      }

      const bucketName = admin.storage().bucket().name;
      const tempAudioFileName = `audio_${videoId}${path.extname(audioFilePath) || '.mp3'}`;
      const tempAudioPath = path.join(os.tmpdir(), tempAudioFileName);

      try {
        logger.info(
          `Downloading audio ${audioFilePath} from bucket ${bucketName} to ${tempAudioPath}`
        );
        await storage
          .bucket(bucketName)
          .file(audioFilePath)
          .download({ destination: tempAudioPath });
        logger.info(`Audio downloaded successfully for video: ${videoId}`);

        logger.info(`Sending audio to Groq for transcription: ${videoId}`);
        const transcription = await groq.audio.transcriptions.create({
          file: fs.createReadStream(tempAudioPath),
          model: 'whisper-large-v3',
        });
        logger.info(
          `Transcription received successfully for video: ${videoId}`
        );

        await videoRef.update({
          transcript: transcription.text,
          transcriptionStatus: 'completed',
        });
        logger.info(`Firestore updated with transcript for video: ${videoId}`);
      } catch (error) {
        logger.error(
          `Error during transcription process for video ${videoId}:`,
          error
        );
        try {
          await videoRef.update({ transcriptionStatus: 'failed' });
          logger.info(
            `Set transcriptionStatus to 'failed' for video: ${videoId}`
          );
        } catch (updateError) {
          logger.error(
            `Failed to update transcriptionStatus to 'failed' for video: ${videoId}`,
            updateError
          );
        }
      } finally {
        try {
          if (fs.existsSync(tempAudioPath)) {
            fs.unlinkSync(tempAudioPath);
            logger.info(`Cleaned up temporary audio file: ${tempAudioPath}`);
          }
        } catch (cleanupError) {
          logger.error(
            `Error cleaning up temporary audio file for video ${videoId}:`,
            cleanupError
          );
        }
      }
    }
  );
