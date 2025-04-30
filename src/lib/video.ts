import {
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp, // Import Timestamp
  query,     // Added
  where,     // Added
  orderBy,   // Added
  getDocs,   // Added
} from 'firebase/firestore';
// No need for external uuid package, use built-in crypto
import { storage, db } from './firebase'; // Import initialized instances

/**
 * Represents the metadata for a video stored in Firestore.
 */
export type VideoMetadata = {
  id?: string; // Firestore document ID (added after creation)
  userId: string;
  storagePath: string; // Full path in Firebase Storage (e.g., videos/userId/videoId.mp4)
  fileName: string; // Original file name
  contentType: string; // MIME type (e.g., 'video/mp4')
  status:
    | 'uploading'
    | 'uploaded_to_storage'
    | 'processing_failed'
    | 'ready_for_youtube';
  createdAt: Timestamp; // Firestore Timestamp
  youtubeVideoId?: string; // ID after successful YouTube upload
  title?: string; // User-defined or generated title
  description?: string; // User-defined or generated description
  audioStoragePath?: string; // Path to the extracted audio in Storage
  audioProcessingStatus?: 'pending' | 'processing' | 'completed' | 'failed'; // Status of audio extraction
  // Add other relevant fields like duration, thumbnails, etc. later
};

/**
 * Uploads a video file to Firebase Storage under a user-specific path.
 *
 * @param file The video file to upload.
 * @param userId The ID of the user uploading the video.
 * @param progressCallback Optional callback to report upload progress (0-100).
 * @returns A promise that resolves with the storage path, original filename, and content type.
 * @throws Throws an error if the upload fails.
 */
export async function uploadVideoToStorage(
  file: File,
  userId: string,
  progressCallback?: (progress: number) => void,
): Promise<{ storagePath: string; fileName: string; contentType: string }> {
  if (!userId) {
    throw new Error('User ID is required for uploading video.');
  }
  if (!file) {
    throw new Error('File is required for uploading video.');
  }

  const uniqueVideoId = crypto.randomUUID(); // Use built-in crypto for unique ID
  // New path structure: {userId}/{videoId}/{filename}
  const storagePath = `${userId}/${uniqueVideoId}/${file.name}`;
  const storageRef = ref(storage, storagePath);

  console.log(`Uploading video to: ${storagePath}`);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        if (progressCallback) {
          progressCallback(progress);
        }
        // Handle states like 'paused', 'running' if needed
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error('Upload failed:', error);
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            reject(
              new Error("User doesn't have permission to access the object"),
            );
            break;
          case 'storage/canceled':
            reject(new Error('User canceled the upload'));
            break;
          case 'storage/unknown':
            reject(
              new Error('Unknown error occurred, inspect error.serverResponse'),
            );
            break;
          default:
            reject(new Error(`Upload failed: ${error.message}`));
        }
      },
      () => {
        // Handle successful uploads on complete
        console.log('Upload successful!');
        // We don't need the download URL right now, just the path
        // getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        //   console.log('File available at', downloadURL);
        // });
        resolve({
          storagePath: storagePath, // Return the full path
          fileName: file.name,
          contentType: file.type,
        });
      },
    );
  });
}

/**
 * Creates a video metadata record in Firestore.
 *
 * @param metadata The video metadata (excluding id and createdAt, which are added automatically).
 * @returns A promise that resolves with the ID of the newly created Firestore document.
 * @throws Throws an error if the Firestore operation fails.
 */
export async function createVideoRecord(
  metadata: Omit<VideoMetadata, 'id' | 'createdAt'>,
): Promise<string> {
  try {
    const videoCollectionRef = collection(db, 'videos');
    const docRef = await addDoc(videoCollectionRef, {
      ...metadata,
      createdAt: serverTimestamp(), // Use server timestamp
    });
    console.log('Video record created with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding video document: ', error);
    throw new Error('Failed to create video record in Firestore.');
  }
}

/**
 * Fetches video metadata records for a specific user from Firestore.
 *
 * @param userId The ID of the user whose videos to fetch.
 * @returns A promise that resolves with an array of VideoMetadata objects.
 * @throws Throws an error if the Firestore query fails.
 */
export async function getUserVideos(userId: string): Promise<VideoMetadata[]> {
  if (!userId) {
    throw new Error('User ID is required to fetch videos.');
  }

  try {
    const videoCollectionRef = collection(db, 'videos');
    const q = query(videoCollectionRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const videos: VideoMetadata[] = [];
    querySnapshot.forEach((doc) => {
      // Combine document ID with data, ensuring createdAt is handled correctly
      const data = doc.data();
      videos.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt, // Already a Timestamp
      } as VideoMetadata); // Type assertion might be needed depending on strictness
    });

    console.log(`Fetched ${videos.length} videos for user ${userId}`);
    return videos;
  } catch (error) {
    console.error('Error fetching user videos: ', error);
    throw new Error('Failed to fetch video records from Firestore.');
  }
}
