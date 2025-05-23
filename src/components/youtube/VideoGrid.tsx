'use client';

import React from 'react';
import { VideoMetadata } from '@/lib/video';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

/** Props for the VideoGrid */
type VideoGridProps = {
  videos: VideoMetadata[];
  isLoading: boolean;
  error: string | null;
};

/**
 * Displays a grid of user's uploaded videos.
 */
export function VideoGrid({ videos, isLoading, error }: VideoGridProps) {
  if (isLoading) {
    return <div className="text-center p-4">Loading videos...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        Error loading videos: {error}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        You haven&apos;t uploaded any videos yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Card key={video.id}>
          <CardHeader>
            <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center mb-2">
              <span className="text-muted-foreground text-sm">
                No Thumbnail
              </span>
            </div>
            <CardTitle className="text-lg truncate" title={video.fileName}>
              {video.fileName}
            </CardTitle>
            <CardDescription className="text-xs">
              Uploaded: {video.createdAt.toDate().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Status: {video.status.replace(/_/g, ' ')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
