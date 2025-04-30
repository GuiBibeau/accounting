'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { VideoUploadForm } from '@/components/youtube/VideoUploadForm';
import { VideoGrid } from '@/components/youtube/VideoGrid';
import { getUserVideos, type VideoMetadata } from '@/lib/video';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';


const YouTubePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [videosLoading, setVideosLoading] = useState<boolean>(true);
  const [videosError, setVideosError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    if (!user?.uid) return; // Don't fetch if no user

    setVideosLoading(true);
    setVideosError(null);
    try {
      const userVideos = await getUserVideos(user.uid);
      setVideos(userVideos);
    } catch (err: unknown) {
      console.error("Failed to fetch videos:", err);
      const errorMessage = err instanceof Error ? err.message : 'Could not load videos.';
      setVideosError(errorMessage);
    } finally {
      setVideosLoading(false);
    }
  }, [user?.uid]); 

  useEffect(() => {
    if (user?.uid) {
      fetchVideos();
    } else {
      setVideos([]);
      setVideosLoading(false);
      setVideosError(null);
    }
  }, [user?.uid, fetchVideos]); 

  useEffect(() => {
    if (user?.uid) {
      fetchVideos();
    } else {
      setVideos([]);
      setVideosLoading(false);
      setVideosError(null);
    }
  }, [user?.uid, fetchVideos]);

  const handleUploadComplete = () => {
    setIsUploadModalOpen(false);
    fetchVideos();
  };

  if (authLoading) {
    return <div className="p-4 text-center">Authenticating...</div>;
  }

  if (!user) {
     return <div className="p-4 text-center">Please log in to manage YouTube videos.</div>;
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
      <SiteHeader title="YouTube Management" actions={headerActions} />
      <div className="flex flex-col flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <VideoGrid videos={videos} isLoading={videosLoading} error={videosError} />
      </div>
    </>
  );
};

export default YouTubePage;
