'use client';

import React from 'react';
import { YouTubeVideoCard, type YouTubeVideoDetails } from './YouTubeVideoCard';

type PublishedVideosGridProps = {
  videos: YouTubeVideoDetails[];
  isLoading: boolean;
  error: string | null;
};

export function PublishedVideosGrid({
  videos,
  isLoading,
  error,
}: PublishedVideosGridProps) {
  if (isLoading) {
    return <div className="text-center p-4">Loading published videos...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error loading videos: {error}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No published videos found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <YouTubeVideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
