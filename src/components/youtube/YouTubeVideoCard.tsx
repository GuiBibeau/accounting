'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export type YouTubeVideoDetails = {
  id: string;
  title: string;
  thumbnailUrl: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  publishedAt: string;
};

type YouTubeVideoCardProps = {
  video: YouTubeVideoDetails;
};

const formatCount = (count?: string): string => {
  if (!count) return '0';
  const num = parseInt(count, 10);
  if (isNaN(num)) return '0';

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

export function YouTubeVideoCard({ video }: YouTubeVideoCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        {video.thumbnailUrl ? (
          <div className="aspect-video relative w-full">
            <Image
              src={video.thumbnailUrl}
              alt={`Thumbnail for ${video.title}`}
              layout="fill"
              objectFit="cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No Thumbnail</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <CardTitle
          className="text-md font-semibold leading-tight line-clamp-2"
          title={video.title}
        >
          {video.title}
        </CardTitle>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Published: {new Date(video.publishedAt).toLocaleDateString()}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <p>Views: {formatCount(video.viewCount)}</p>
            <p>Likes: {formatCount(video.likeCount)}</p>
            <p>Comments: {formatCount(video.commentCount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
