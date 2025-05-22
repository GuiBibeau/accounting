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
import { PublishedVideosGrid } from '@/components/youtube/PublishedVideosGrid';
import { type YouTubeVideoDetails } from '@/components/youtube/YouTubeVideoCard';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const ChannelPage = () => {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [publishedVideos, setPublishedVideos] = useState<YouTubeVideoDetails[]>(
    []
  );
  const [publishedVideosLoading, setPublishedVideosLoading] =
    useState<boolean>(true);
  const [publishedVideosError, setPublishedVideosError] = useState<
    string | null
  >(null);

  const fetchPublishedVideos = useCallback(async () => {
    if (!user) {
      setPublishedVideos([]);
      setPublishedVideosLoading(false);
      setPublishedVideosError(null);
      return;
    }

    setPublishedVideosLoading(true);
    setPublishedVideosError(null);

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
          errorData.message || 'Failed to fetch channel details.'
        );
      }

      const { channelId } = await response.json();

      if (!channelId) {
        throw new Error('Channel ID not found.');
      }

      const videosCollectionPath = `youtubeChannels/${channelId}/videos`;
      const videosQuery = query(
        collection(db, videosCollectionPath),
        orderBy('publishedAt', 'desc')
      );
      const querySnapshot = await getDocs(videosQuery);

      const fetchedVideos: YouTubeVideoDetails[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedVideos.push({
          id: doc.id,
          title: data.title || 'Untitled Video',
          thumbnailUrl: data.thumbnailUrl || '',
          viewCount: data.viewCount,
          likeCount: data.likeCount,
          commentCount: data.commentCount,
          publishedAt: data.publishedAt || new Date().toISOString(),
        });
      });
      setPublishedVideos(fetchedVideos);
    } catch (err: unknown) {
      console.error('Failed to fetch published videos:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Could not load published videos.';
      setPublishedVideosError(errorMessage);
    } finally {
      setPublishedVideosLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPublishedVideos();
  }, [fetchPublishedVideos]);

  const handleUploadComplete = () => {
    setIsUploadModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Published YouTube Videos</h2>
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Upload Internal Video</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Internal Video</DialogTitle>
            </DialogHeader>
            <VideoUploadForm onUploadComplete={handleUploadComplete} />
          </DialogContent>
        </Dialog>
      </div>
      <PublishedVideosGrid
        videos={publishedVideos}
        isLoading={publishedVideosLoading}
        error={publishedVideosError}
      />
    </div>
  );
};

export default ChannelPage;
