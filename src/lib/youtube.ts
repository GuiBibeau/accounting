import { OAuth2Client } from 'google-auth-library';
import { google, youtube_v3 } from 'googleapis';
import { adminDb } from '@/lib/firebase-admin';
import { decrypt, encrypt } from '@/lib/encryption';
import * as admin from 'firebase-admin';
import { GaxiosError } from 'gaxios';


export type YouTubeCredentials = {
  encryptedAccessToken: string;
  encryptedRefreshToken?: string;
  expiryDate: number | null;
  scopes?: string;
  updatedAt: admin.firestore.Timestamp | Date;
};

type ChannelMetadata = {
  id: string;
  userId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  viewCount?: string;
  subscriberCount?: string;
  videoCount?: string;
  lastSyncedAt?: admin.firestore.Timestamp | Date;
};

type VideoDetails = {
  id: string;
  userId: string;
  channelId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
};

type CommentDetails = {
  id: string;
  userId: string;
  channelId: string;
  videoId: string;
  text: string;
  authorDisplayName: string;
  authorProfileImageUrl?: string;
  publishedAt: string;
  updatedAt?: string;
  likeCount: number;
  totalReplyCount?: number;
  parentId?: string;
};

const getCredentialsPath = (userId: string) =>
  `users/${userId}/integrations/youtube`;

const getChannelCollectionPath = () => `youtubeChannels`;
const getChannelDocPath = (channelId: string) =>
  `${getChannelCollectionPath()}/${channelId}`;
const getChannelMetadataPath = (channelId: string) =>
  `${getChannelDocPath(channelId)}/metadata/doc`;

const getVideoCollectionPath = (channelId: string) =>
  `${getChannelDocPath(channelId)}/videos`;
const getVideoPath = (channelId: string, videoId: string) =>
  `${getVideoCollectionPath(channelId)}/${videoId}`;

const getCommentCollectionPath = (channelId: string, videoId: string) =>
  `${getVideoPath(channelId, videoId)}/comments`;

async function getYoutubeClient(userId: string): Promise<OAuth2Client> {
  const credsDoc = await adminDb.doc(getCredentialsPath(userId)).get();
  if (!credsDoc.exists) {
    throw new Error(`YouTube credentials not found for user ${userId}`);
  }

  const credentials = credsDoc.data() as YouTubeCredentials;

  if (!credentials.encryptedAccessToken) {
      throw new Error(`Missing encryptedAccessToken for user ${userId}`);
  }

  const accessToken = decrypt(credentials.encryptedAccessToken);
  const refreshToken = credentials.encryptedRefreshToken
    ? decrypt(credentials.encryptedRefreshToken)
    : undefined;

  const oauthClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauthClient.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: credentials.expiryDate,
    scope: credentials.scopes,
  });

  oauthClient.on('tokens', async (tokens) => {
    const updateData: Partial<YouTubeCredentials> = {
        updatedAt: new Date(),
        expiryDate: tokens.expiry_date ?? null,
        scopes: tokens.scope,
    };

    if (tokens.access_token) {
        updateData.encryptedAccessToken = encrypt(tokens.access_token);
    }

    if (tokens.refresh_token) {
      console.log('Received new refresh token for user:', userId);
      updateData.encryptedRefreshToken = encrypt(tokens.refresh_token);
    } else if (tokens.access_token) {
       console.log('Refreshed access token for user:', userId);
    }

    if (tokens.access_token || tokens.refresh_token) {
        try {
            await adminDb.doc(getCredentialsPath(userId)).set(updateData, { merge: true });
        } catch (error) {
            console.error(`Failed to update YouTube tokens in Firestore for user ${userId}:`, error);
        }
    }
  });

  return oauthClient;
}

async function getYoutubeApi(userId: string): Promise<youtube_v3.Youtube> {
  const auth = await getYoutubeClient(userId);
  return google.youtube({ version: 'v3', auth });
}

export async function getChannelMetadata(userId: string): Promise<Omit<ChannelMetadata, 'userId' | 'lastSyncedAt'> | null> {
  try {
    const youtube = await getYoutubeApi(userId);
    const response = await youtube.channels.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
      maxResults: 1
    });

    if (!response.data.items || response.data.items.length === 0) {
      console.warn(`No channel found for user ${userId}`);
      return null;
    }

    const channel = response.data.items[0];
    if (!channel.id) {
        console.error(`Channel ID missing in API response for user ${userId}`);
        return null;
    }

    return {
      id: channel.id,
      title: channel.snippet?.title ?? '',
      description: channel.snippet?.description ?? '',
      publishedAt: channel.snippet?.publishedAt ?? '',
      thumbnailUrl: channel.snippet?.thumbnails?.default?.url ?? '',
      viewCount: channel.statistics?.viewCount ?? undefined,
      subscriberCount: channel.statistics?.subscriberCount ?? undefined,
      videoCount: channel.statistics?.videoCount ?? undefined,
    };
  } catch (error) {
    console.error(`Error fetching channel metadata for user ${userId}:`, error);
    throw error;
  }
}

async function getAllVideosByChannelId(userId: string, channelId: string): Promise<Omit<VideoDetails, 'userId' | 'channelId'>[]> {
    console.log(`Fetching videos for channel ${channelId} (user ${userId})`);
    const youtube = await getYoutubeApi(userId);
    const allVideos: Omit<VideoDetails, 'userId' | 'channelId'>[] = [];
    let nextPageToken: string | undefined = undefined;

    try {
        const videoIds: string[] = [];
        do {
            const searchResponse: youtube_v3.Schema$SearchListResponse = (await youtube.search.list({
                part: ['id'], channelId: channelId, maxResults: 50, type: ['video'],
                pageToken: nextPageToken, order: 'date',
            })).data;
            searchResponse.items?.forEach((item: youtube_v3.Schema$SearchResult) => { if (item.id?.videoId) videoIds.push(item.id.videoId); });
            nextPageToken = searchResponse.nextPageToken ?? undefined;
        } while (nextPageToken);
        console.log(`Found ${videoIds.length} video IDs for channel ${channelId}`);

        for (let i = 0; i < videoIds.length; i += 50) {
            const batchIds = videoIds.slice(i, i + 50);
            const videoResponse = await youtube.videos.list({
                part: ['snippet', 'statistics', 'contentDetails'], id: batchIds, maxResults: 50,
            });
            videoResponse.data.items?.forEach(video => {
                if (!video.id) return;
                allVideos.push({
                    id: video.id,
                    title: video.snippet?.title ?? '',
                    description: video.snippet?.description ?? '',
                    publishedAt: video.snippet?.publishedAt ?? '',
                    thumbnailUrl: video.snippet?.thumbnails?.default?.url ?? '',
                    duration: video.contentDetails?.duration ?? undefined,
                    viewCount: video.statistics?.viewCount ?? undefined,
                    likeCount: video.statistics?.likeCount ?? undefined,
                    commentCount: video.statistics?.commentCount ?? undefined,
                });
            });
            console.log(`Fetched details for videos ${i+1} to ${Math.min(i+50, videoIds.length)} for channel ${channelId}`);
        }
        return allVideos;
    } catch (error) {
        console.error(`Error fetching videos for channel ${channelId} (user ${userId}):`, error);
        throw error;
    }
}

export async function getVideoComments(userId: string, videoId: string): Promise<Omit<CommentDetails, 'userId' | 'channelId' | 'videoId'>[]> {
  const youtube = await getYoutubeApi(userId);
  const allComments: Omit<CommentDetails, 'userId' | 'channelId' | 'videoId'>[] = [];
  let nextPageToken: string | undefined = undefined;

  try {
    do {
      const response: youtube_v3.Schema$CommentThreadListResponse = (await youtube.commentThreads.list({
        part: ['snippet', 'replies'],
        videoId: videoId,
        maxResults: 100,
        pageToken: nextPageToken,
        textFormat: 'plainText',
      })).data;

      response.items?.forEach((thread: youtube_v3.Schema$CommentThread) => {
        const topLevelComment = thread.snippet?.topLevelComment;
        if (topLevelComment?.id && topLevelComment.snippet) {
          allComments.push({
            id: topLevelComment.id,
            text: topLevelComment.snippet.textDisplay ?? '',
            authorDisplayName: topLevelComment.snippet.authorDisplayName ?? '',
            authorProfileImageUrl: topLevelComment.snippet.authorProfileImageUrl ?? undefined,
            publishedAt: topLevelComment.snippet.publishedAt ?? '',
            updatedAt: topLevelComment.snippet.updatedAt ?? undefined,
            likeCount: topLevelComment.snippet.likeCount ?? 0,
            totalReplyCount: thread.snippet?.totalReplyCount ?? undefined,
            parentId: topLevelComment.snippet.parentId ?? undefined,
          });
        }
      });

      nextPageToken = response.nextPageToken ?? undefined;
    } while (nextPageToken);

    console.log(`Fetched ${allComments.length} top-level comment threads for video ${videoId}`);
    return allComments;
  } catch (error) {
     const gaxiosError = error as GaxiosError;
     if (gaxiosError.response?.data?.error?.errors?.[0]?.reason === 'commentsDisabled') {
        console.warn(`Comments are disabled for video ${videoId}`);
        return [];
     }
     console.error(`Error fetching comments for video ${videoId} (user ${userId}):`, error);
     throw error;
  }
}

export async function saveChannelData(userId: string, data: Omit<ChannelMetadata, 'userId' | 'lastSyncedAt'>): Promise<void> {
  if (!data.id) {
      console.error("Cannot save channel data without a channel ID.");
      throw new Error("Channel ID is missing in data to be saved.");
  }
  const channelId = data.id;
  const metadataPath = getChannelMetadataPath(channelId);
  const channelDataToSave: ChannelMetadata = {
      ...data,
      userId: userId,
      lastSyncedAt: new Date()
  };

  try {
    await adminDb.doc(metadataPath).set(channelDataToSave, { merge: true });
    console.log(`Saved channel metadata for channel ${channelId} (user ${userId})`);
  } catch (error) {
    console.error(`Error saving channel metadata for channel ${channelId} (user ${userId}):`, error);
    throw error;
  }
}

export async function saveVideoData(userId: string, channelId: string, videos: Omit<VideoDetails, 'userId' | 'channelId'>[]): Promise<void> {
  if (videos.length === 0) return;

  const batch = adminDb.batch();
  const videoCollectionRef = adminDb.collection(getVideoCollectionPath(channelId));

  videos.forEach(video => {
    if (!video.id) {
        console.warn("Skipping video save due to missing ID:", video);
        return;
    }
    const videoRef = videoCollectionRef.doc(video.id);
    const videoDataToSave: VideoDetails = {
        ...video,
        userId: userId,
        channelId: channelId
    };
    batch.set(videoRef, videoDataToSave, { merge: true });
  });

  try {
    await batch.commit();
    console.log(`Saved ${videos.length} videos for channel ${channelId} (user ${userId})`);
  } catch (error) {
    console.error(`Error saving video data for channel ${channelId} (user ${userId}):`, error);
    throw error;
  }
}

export async function saveCommentData(userId: string, channelId: string, videoId: string, comments: Omit<CommentDetails, 'userId' | 'channelId' | 'videoId'>[]): Promise<void> {
   if (comments.length === 0) return;

   const batch = adminDb.batch();
   const commentCollectionRef = adminDb.collection(getCommentCollectionPath(channelId, videoId));

   comments.forEach(comment => {
     if (!comment.id) {
         console.warn("Skipping comment save due to missing ID:", comment);
         return;
     }
     const commentRef = commentCollectionRef.doc(comment.id);

     // Build the data object explicitly, adding optional fields only if defined
     const commentDataToSave: Partial<CommentDetails> = {
        // Required fields
        id: comment.id,
        userId: userId,
        channelId: channelId,
        videoId: videoId,
        text: comment.text,
        authorDisplayName: comment.authorDisplayName,
        publishedAt: comment.publishedAt,
        likeCount: comment.likeCount,
     };

     if (comment.authorProfileImageUrl !== undefined) {
        commentDataToSave.authorProfileImageUrl = comment.authorProfileImageUrl;
     }
     if (comment.updatedAt !== undefined) {
        commentDataToSave.updatedAt = comment.updatedAt;
     }
     if (comment.totalReplyCount !== undefined) {
        commentDataToSave.totalReplyCount = comment.totalReplyCount;
     }
     if (comment.parentId !== undefined) {
        commentDataToSave.parentId = comment.parentId;
     }

     batch.set(commentRef, commentDataToSave, { merge: true });
   });

   try {
     await batch.commit();
     console.log(`Saved ${comments.length} comments for video ${videoId}, channel ${channelId} (user ${userId})`);
   } catch (error) {
     console.error(`Error saving comment data for video ${videoId}, channel ${channelId} (user ${userId}):`, error);
     throw error;
   }
}

export async function syncYoutubeData(userId: string): Promise<void> {
  console.log(`Starting YouTube data sync for user ${userId}...`);
  try {
    const channelMetadataResult = await getChannelMetadata(userId);

    if (channelMetadataResult && channelMetadataResult.id) {
      const channelId = channelMetadataResult.id;
      console.log(`Found channel ID: ${channelId} for user ${userId}`);

      await saveChannelData(userId, channelMetadataResult);

      const videos = await getAllVideosByChannelId(userId, channelId);
      await saveVideoData(userId, channelId, videos);

      let totalCommentsSaved = 0;
      for (const video of videos) {
        if (!video.id) {
            console.warn(`Skipping comments for video with missing ID (channel ${channelId})`);
            continue;
        }
        try {
            if (video.commentCount && parseInt(video.commentCount, 10) > 0) {
                const comments = await getVideoComments(userId, video.id);
                if (comments.length > 0) {
                    await saveCommentData(userId, channelId, video.id, comments);
                    totalCommentsSaved += comments.length;
                }
            }
        } catch (commentError) {
            console.error(`Failed to sync comments for video ${video.id} (channel ${channelId}, user ${userId}):`, commentError);
        }
      }
      console.log(`Saved a total of ${totalCommentsSaved} top-level comments across all videos for channel ${channelId} (user ${userId}).`);

      try {
          await adminDb.doc(getChannelMetadataPath(channelId)).update({
              lastSyncedAt: new Date()
          });
          console.log(`Updated lastSyncedAt for channel ${channelId}`);
      } catch (updateError) {
          console.error(`Failed to update lastSyncedAt for channel ${channelId}:`, updateError);
      }

    } else {
        console.warn(`Cannot sync data as channel ID could not be determined for user ${userId}`);
    }
    console.log(`YouTube data sync completed for user ${userId}.`);
  } catch (error) {
    console.error(`YouTube data sync failed for user ${userId}:`, error);
    throw error;
  }
}
