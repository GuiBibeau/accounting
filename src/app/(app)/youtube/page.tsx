'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { VideoUploadForm } from '@/components/youtube/VideoUploadForm';
import { VideoGrid } from '@/components/youtube/VideoGrid';
import { getUserVideos, type VideoMetadata } from '@/lib/video';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header'; 

type ViewState = 'grid' | 'upload';

const YouTubePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<ViewState>('grid'); 
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
    } catch (err: any) {
      console.error("Failed to fetch videos:", err);
      setVideosError(err.message || 'Could not load videos.');
    } finally {
      setVideosLoading(false);
    }
  }, [user?.uid]); // Dependency on user ID

  // Fetch videos when the component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      fetchVideos();
    } else {
      // Clear videos if user logs out
      setVideos([]);
      setVideosLoading(false);
      setVideosError(null);
    }
  }, [user?.uid, fetchVideos]);

  const handleUploadComplete = () => {
    setView('grid'); // Switch back to grid view
    fetchVideos(); // Refresh the video list
  };

  if (authLoading) {
    return <div className="p-4 text-center">Authenticating...</div>;
  }

  if (!user) {
     return <div className="p-4 text-center">Please log in to manage YouTube videos.</div>;
   }

  const headerActions = view === 'grid' ? (
    <Button onClick={() => setView('upload')} size="sm">Upload New Video</Button>
  ) : ( // view === 'upload'
    <Button variant="outline" onClick={() => setView('grid')} size="sm">Cancel Upload</Button>
  );

  return (
    <> 
      <SiteHeader title="YouTube Management" actions={headerActions} />
      <div className="flex flex-col flex-1 overflow-y-auto p-4 lg:p-6 space-y-6"> 

        {view === 'upload' && (
          <>
            <div className="flex justify-center items-start pt-10">
              <VideoUploadForm onUploadComplete={handleUploadComplete} />
            </div>
          </>
        )}

        {view === 'grid' && (
          <VideoGrid videos={videos} isLoading={videosLoading} error={videosError} />
        )}

      </div>
    </>
  );
};

export default YouTubePage;
