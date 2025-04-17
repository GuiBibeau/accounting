// src/lib/youtube.ts
import { doc, setDoc, collection, query, where } from "firebase/firestore";
import { db } from "./firebase";

// Represents the core statistics for a YouTube video
export interface YoutubeVideoStatistics {
  viewCount: number;
  likeCount: number;
  dislikeCount?: number; // May not always be available
  favoriteCount: number; // Often 0, but part of the API
  commentCount: number;
  // Add any other relevant statistics you need
}

// Represents metadata and content details of a YouTube video
export interface YoutubeVideo {
  id: string; // YouTube's video ID
  publishedAt: string; // ISO 8601 format date
  title: string;
  description: string;
  thumbnailUrl: string; // URL for the default thumbnail
  tags?: string[];
  categoryId?: string;
  liveBroadcastContent?: string; // e.g., 'none', 'live', 'upcoming'
  duration?: string; // ISO 8601 duration format (e.g., PT15M33S)
  statistics: YoutubeVideoStatistics;
}

// Represents the overall YouTube channel information
export interface YoutubeChannel {
  id: string; // YouTube's channel ID (also used as Firestore doc ID)
  userId: string; // Link to the user in your app's user collection
  title: string;
  description: string;
  customUrl?: string;
  publishedAt: string; // ISO 8601 format date
  thumbnailUrl: string; // URL for the default channel thumbnail
  statistics: {
    viewCount: number;
    subscriberCount: number; // Note: Often rounded/approximated by API
    hiddenSubscriberCount: boolean;
    videoCount: number;
  };
}

// YouTube Channel Operations
export async function saveYoutubeChannel(channel: YoutubeChannel) {
  const channelRef = doc(db, 'youtubeChannels', channel.id);
  await setDoc(channelRef, channel);
  return channelRef;
}

export async function saveYoutubeVideo(video: YoutubeVideo) {
  const videoRef = doc(db, 'youtubeVideos', video.id);
  await setDoc(videoRef, video);
  return videoRef;
}

export function getYoutubeChannelRef(channelId: string) {
  return doc(db, 'youtubeChannels', channelId);
}

export function getYoutubeVideosCollectionRef(channelId: string) {
  const videosCollection = collection(db, 'youtubeVideos');
  return query(videosCollection, where('channelId', '==', channelId));
}
