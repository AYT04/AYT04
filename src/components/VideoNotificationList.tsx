"use client";

import * as React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { BellRing, Youtube, ExternalLink } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Video } from '@/types';

interface VideoNotificationListProps {
  videos: Video[];
}

export function VideoNotificationList({ videos }: VideoNotificationListProps) {

  const sortedVideos = React.useMemo(() => {
    return [...videos].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
      const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
      return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
    });
  }, [videos]);


  return (
    <Card className="w-full max-w-lg mx-auto shadow-md mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-6 h-6 text-primary" />
          Latest Video Notifications
        </CardTitle>
        <CardDescription>New uploads from your configured channels.</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedVideos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No new videos found, or no channels configured yet. Check back later!
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4"> {/* Added padding-right for scrollbar */}
            <ul className="space-y-4">
              {sortedVideos.map((video, index) => (
                <React.Fragment key={video.id}>
                  <li className="flex items-start space-x-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={`Thumbnail for ${video.title}`}
                        width={120}
                        height={90} // Standard YouTube thumbnail aspect ratio
                        className="rounded-md object-cover flex-shrink-0"
                        unoptimized // Use if picsum or similar external, potentially non-optimized source
                      />
                    ) : (
                      <div className="w-[120px] h-[90px] bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Youtube className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-grow min-w-0"> {/* Ensure text wraps */}
                       <div className='flex justify-between items-start'>
                           <h3 className="font-semibold text-base leading-snug mb-1 break-words"> {/* Allow word breaking */}
                                {video.title}
                           </h3>
                           <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="ml-2 flex-shrink-0"
                            >
                                <a href={video.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${video.title} on YouTube`}>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                       </div>

                      <Badge variant="secondary" className="mb-2">{video.channelTitle || video.channelId}</Badge>
                      {video.publishedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </li>
                  {index < sortedVideos.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
