import * as functions from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const db = admin.firestore();
const storage = new Storage();

const functionOptions: functions.tasks.TaskQueueOptions &
  functions.GlobalOptions = {
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 300,
};

/**
 * Triggered when a new video document is created in Firestore.
 * Downloads the video, extracts audio using ffmpeg, uploads the audio,
 * and updates the Firestore document.
 */
export const onVideoCreated = functions.firestore.onDocumentCreated(
  { document: 'videos/{videoId}', ...functionOptions },
  async (event) => {
    logger.info('Function triggered for video:', event.params.videoId);

    const videoId = event.params.videoId;
    const snapshot = event.data;
    if (!snapshot) {
      logger.error('No data associated with the event for video:', videoId);
      return;
    }

    type VideoData = {
      userId: string;
      storagePath: string;
    };

    const videoData = snapshot.data() as VideoData;

    if (!videoData.storagePath || !videoData.userId) {
      logger.error(
        'Missing storagePath or userId in video document:',
        videoId,
        videoData
      );
      return;
    }

    const videoRef = db.collection('videos').doc(videoId);

    try {
      await videoRef.update({ audioProcessingStatus: 'processing' });
      logger.info(
        "Set audioProcessingStatus to 'processing' for video:",
        videoId
      );
    } catch (error) {
      logger.error(
        "Failed to update status to 'processing' for video:",
        videoId,
        error
      );
      return;
    }

    const bucketName = admin.storage().bucket().name;
    const videoFilePath = videoData.storagePath;
    const userId = videoData.userId;
    const originalFileName = path.basename(videoFilePath);

    const tempVideoPath = path.join(os.tmpdir(), originalFileName);
    const tempAudioFileName = `audio_${videoId}.mp3`;
    const tempAudioPath = path.join(os.tmpdir(), tempAudioFileName);
    const finalAudioStoragePath = `${userId}/${videoId}/audio.mp3`;

    try {
      logger.info(
        `Downloading video ${videoFilePath} from bucket ${bucketName} to ${tempVideoPath}`
      );
      await storage
        .bucket(bucketName)
        .file(videoFilePath)
        .download({ destination: tempVideoPath });
      logger.info('Video downloaded successfully:', videoId);

      logger.info(
        `Starting audio extraction for video ${videoId} to ${tempAudioPath}`
      );
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .noVideo()
          .audioCodec('libmp3lame')
          .outputOptions('-q:a', '2')
          .save(tempAudioPath)
          .on('end', () => {
            logger.info('Audio extraction finished successfully:', videoId);
            resolve();
          })
          .on('error', (err: Error) => {
            logger.error('Error during ffmpeg processing:', videoId, err);
            reject(err);
          });
      });

      logger.info(
        `Uploading extracted audio to ${finalAudioStoragePath} in bucket ${bucketName}`
      );
      await storage.bucket(bucketName).upload(tempAudioPath, {
        destination: finalAudioStoragePath,
        metadata: {
          contentType: 'audio/mpeg',
        },
      });
      logger.info('Audio uploaded successfully:', videoId);

      await videoRef.update({
        audioProcessingStatus: 'completed',
        audioStoragePath: finalAudioStoragePath,
      });
      logger.info('Firestore updated successfully for video:', videoId);
    } catch (error) {
      logger.error('Error processing video:', videoId, error);
      try {
        await videoRef.update({ audioProcessingStatus: 'failed' });
        logger.info(
          "Set audioProcessingStatus to 'failed' for video:",
          videoId
        );
      } catch (updateError) {
        logger.error(
          "Failed to update status to 'failed' for video:",
          videoId,
          updateError
        );
      }
    } finally {
      try {
        if (fs.existsSync(tempVideoPath)) {
          fs.unlinkSync(tempVideoPath);
          logger.info('Cleaned up temporary video file:', tempVideoPath);
        }
        if (fs.existsSync(tempAudioPath)) {
          fs.unlinkSync(tempAudioPath);
          logger.info('Cleaned up temporary audio file:', tempAudioPath);
        }
      } catch (cleanupError) {
        logger.error(
          'Error cleaning up temporary files for video:',
          videoId,
          cleanupError
        );
      }
    }
  }
);
