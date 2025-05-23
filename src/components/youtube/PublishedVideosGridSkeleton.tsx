import React from 'react';
import { YouTubeVideoCardSkeleton } from './YouTubeVideoCardSkeleton';

type PublishedVideosGridSkeletonProps = {
  count?: number;
};

export function PublishedVideosGridSkeleton({
  count = 8, // Default to 8 skeletons
}: PublishedVideosGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <YouTubeVideoCardSkeleton key={index} />
      ))}
    </div>
  );
}
