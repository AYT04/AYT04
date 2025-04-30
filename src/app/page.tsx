"use client";

import * as React from 'react';
import { ConfigurationForm } from '@/components/ConfigurationForm';
import { VideoNotificationList } from '@/components/VideoNotificationList';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import useLocalStorage from '@/hooks/useLocalStorage';
import { getLatestVideos } from '@/lib/youtube';
import type { Channel, Video } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const FETCH_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

export default function Home() {
  const { toast } = useToast();
  const [channels, setChannels] = useLocalStorage<Channel[]>('youtubeChannels', []);
  const [apiKey, setApiKey] = useLocalStorage<string>('youtubeApiKey', '');
  const [latestVideos, setLatestVideos] = useLocalStorage<Video[]>('latestVideos', []);
  const [isLoading, setIsLoading] = React.useState(false);
  const [lastChecked, setLastChecked] = useLocalStorage<number | null>('lastCheckedTimestamp', null);
  const [error, setError] = React.useState<string | null>(null);

  // Ref to store the latest known video IDs for notification purposes
  const lastKnownVideoIds = React.useRef<Set<string>>(new Set(latestVideos.map(v => v.id)));

  const fetchVideos = React.useCallback(async (currentApiKey: string, currentChannels: Channel[], isInitialLoad = false) => {
    if (!currentApiKey || currentChannels.length === 0) {
       setError(currentApiKey ? "No channels configured." : "API Key not configured.");
       setLatestVideos([]); // Clear videos if config is missing
       setIsLoading(false); // Ensure loading stops
      return;
    }

    setError(null); // Clear previous errors
    setIsLoading(true);

    const allFetchedVideos: Video[] = [];
    let fetchErrorOccurred = false;
    let specificErrorMsg = '';


    try {
       const fetchPromises = currentChannels.map(channel =>
            getLatestVideos(channel, currentApiKey).catch(err => {
                console.error(`Failed to fetch videos for channel ${channel.id}:`, err);
                fetchErrorOccurred = true;
                specificErrorMsg = err.message || `Failed to fetch videos for ${channel.name || channel.id}.`;
                // Return an empty array for this channel on error to allow others to proceed
                return [];
            })
       );

        const results = await Promise.all(fetchPromises);
        results.forEach(channelVideos => {
           if (Array.isArray(channelVideos)) { // Ensure it's an array (could be empty on error)
              allFetchedVideos.push(...channelVideos);
           }
        });


        // Deduplicate videos just in case (though unlikely with search API per channel)
        const uniqueVideosMap = new Map<string, Video>();
        allFetchedVideos.forEach(video => {
            if (!uniqueVideosMap.has(video.id)) {
            uniqueVideosMap.set(video.id, video);
            }
        });
        const uniqueVideos = Array.from(uniqueVideosMap.values());

        // Sort by published date descending (most recent first)
        uniqueVideos.sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
        });

       // --- Notification Logic ---
        if (!isInitialLoad && uniqueVideos.length > 0) {
            const newVideos = uniqueVideos.filter(v => !lastKnownVideoIds.current.has(v.id));
            if (newVideos.length > 0) {
            toast({
                title: `TubeAlert: ${newVideos.length} New Video${newVideos.length > 1 ? 's' : ''}!`,
                description: `${newVideos[0].channelTitle || 'A channel'} uploaded "${newVideos[0].title.substring(0, 50)}${newVideos[0].title.length > 50 ? '...' : ''}"${newVideos.length > 1 ? ` and ${newVideos.length - 1} more.` : '.'}`,
                duration: 10000, // Show for 10 seconds
            });
            // Update the ref with all current video IDs
             newVideos.forEach(v => lastKnownVideoIds.current.add(v.id));
             // Optional: Prune the ref if it gets too large, keeping maybe the latest 50?
            }
        } else if (isInitialLoad) {
             // On initial load, just populate the ref
            lastKnownVideoIds.current = new Set(uniqueVideos.map(v => v.id));
        }
         // --- End Notification Logic ---


        setLatestVideos(uniqueVideos);
        setLastChecked(Date.now());

        if (fetchErrorOccurred) {
             setError(specificErrorMsg || "Some channels failed to load. Check console for details.");
        }


    } catch (error: any) {
      console.error("Error fetching videos:", error);
       setError(error.message || "An unexpected error occurred while fetching videos.");
       // Optionally clear videos on major failure, or keep stale data
       // setLatestVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, [setLatestVideos, setLastChecked, toast]); // Removed dependencies that might cause stale closures if not needed


  // Initial fetch on component mount
  React.useEffect(() => {
     fetchVideos(apiKey, channels, true); // Pass true for initial load
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

   // Setup interval for periodic fetching
  React.useEffect(() => {
    const intervalId = setInterval(() => {
        // We read directly from localStorage here or use the state variables 'apiKey' and 'channels'
        // because they are updated via the useLocalStorage hook's setter, which keeps them in sync.
        console.log("Checking for new videos...");
        fetchVideos(apiKey, channels);
    }, FETCH_INTERVAL_MS);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [apiKey, channels, fetchVideos]); // Re-setup interval if config changes

    // Handler for configuration changes from the form
  const handleConfigChange = (newApiKey: string, newChannels: Channel[]) => {
     console.log("Configuration changed, fetching videos immediately...");
    // Update state immediately for responsiveness, though useLocalStorage handles persistence
    // setApiKey(newApiKey); // useLocalStorage handles this
    // setChannels(newChannels); // useLocalStorage handles this
    fetchVideos(newApiKey, newChannels); // Trigger immediate fetch with new config
  };


  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24 bg-background">
       <h1 className="text-4xl font-bold mb-8 text-primary flex items-center gap-3">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#3498db" viewBox="0 0 256 256"><path d="M247.1,73.13A31.21,31.21,0,0,0,225,51.17C207.5,48,128,48,128,48S48.5,48,31,51.17A31.21,31.21,0,0,0,8.9,73.13,324.48,324.48,0,0,0,0,128a324.48,324.48,0,0,0,8.9,54.87A31.21,31.21,0,0,0,31,204.83C48.5,208,128,208,128,208s79.5,0,97-3.17a31.21,31.21,0,0,0,22.1-22.06A324.48,324.48,0,0,0,256,128,324.48,324.48,0,0,0,247.1,73.13ZM104,168V88l72,40Z"></path></svg>
           TubeAlert
        </h1>

      <ConfigurationForm
         onConfigChange={handleConfigChange}
         initialApiKey={apiKey}
         initialChannels={channels}
       />

       {error && (
          <Alert variant="destructive" className="w-full max-w-lg mx-auto mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


      {isLoading ? (
        <div className="w-full max-w-lg mx-auto mt-8 space-y-4">
             <Skeleton className="h-8 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
             <div className="space-y-3 pt-4">
                <Skeleton className="h-[90px] w-full rounded-lg" />
                <Skeleton className="h-[90px] w-full rounded-lg" />
                <Skeleton className="h-[90px] w-full rounded-lg" />
             </div>
        </div>

      ) : (
        <VideoNotificationList videos={latestVideos} />
      )}

      {lastChecked && (
         <p className="text-xs text-muted-foreground mt-8">
            Last checked: {new Date(lastChecked).toLocaleString()}
         </p>
      )}

      <Toaster />
    </main>
  );
}
