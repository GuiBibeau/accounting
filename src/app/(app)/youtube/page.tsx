'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { VideoUploadForm } from '@/components/youtube/VideoUploadForm';
import { VideoGrid } from '@/components/youtube/VideoGrid';
import { getUserVideos, type VideoMetadata } from '@/lib/video';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

const YouTubePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [videosLoading, setVideosLoading] = useState<boolean>(true);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!user?.uid) return;

    setVideosLoading(true);
    setVideosError(null);
    try {
      const userVideos = await getUserVideos(user.uid);
      setVideos(userVideos);
    } catch (err: unknown) {
      console.error('Failed to fetch videos:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Could not load videos.';
      setVideosError(errorMessage);
    } finally {
      setVideosLoading(false);
    }
  }, [user?.uid]);

  const fetchChannelSyncTime = useCallback(async () => {
    if (!user?.uid || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/youtube/channel-details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to fetch channel details: ${response.statusText}`
        );
      }

      const { channelId } = await response.json();

      if (channelId) {
        const channelMetadataPath = `youtubeChannels/${channelId}/metadata/doc`;
        const channelDocRef = doc(db, channelMetadataPath);
        const channelDocSnap = await getDoc(channelDocRef);

        if (channelDocSnap.exists()) {
          const data = channelDocSnap.data();
          if (data.lastSyncedAt && data.lastSyncedAt instanceof Timestamp) {
            setLastSyncedAt(data.lastSyncedAt.toDate().toLocaleString());
          } else {
            setLastSyncedAt('Never');
          }
        } else {
          setLastSyncedAt('Never');
          console.warn(
            `Channel metadata document not found at ${channelMetadataPath}`
          );
        }
      } else {
        setLastSyncedAt(null);
        console.warn('Channel ID not found in API response.');
      }
    } catch (error) {
      console.error('Failed to fetch last synced time:', error);
      setLastSyncedAt('Error');
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      fetchVideos();
      fetchChannelSyncTime();
    } else {
      setVideos([]);
      setVideosLoading(false);
      setVideosError(null);
      setLastSyncedAt(null);
    }
  }, [user, fetchVideos, fetchChannelSyncTime]);

  const handleUploadComplete = () => {
    setIsUploadModalOpen(false);
    fetchVideos();
    fetchChannelSyncTime();
  };

  if (authLoading) {
    return <div className="p-4 text-center">Authenticating...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        Please log in to manage YouTube videos.
      </div>
    );
  }

  const headerActions = (
    <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Upload New Video</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload New Video</DialogTitle>
        </DialogHeader>
        <VideoUploadForm onUploadComplete={handleUploadComplete} />
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <SiteHeader
        title="YouTube Management"
        actions={headerActions}
        lastSyncedAt={lastSyncedAt}
      />
      <div className="flex flex-col flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <VideoGrid
          videos={videos}
          isLoading={videosLoading}
          error={videosError}
        />
      </div>
    </>
  );
};

export default YouTubePage;
