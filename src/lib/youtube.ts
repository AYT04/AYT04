import type { Channel, Video } from '@/types';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const MAX_RESULTS_PER_CHANNEL = 5; // Number of recent videos to fetch per channel

/**
 * Asynchronously retrieves the latest videos from a YouTube channel using the Search API.
 *
 * @param channel The YouTube channel to retrieve videos from.
 * @param apiKey The API key to use for the YouTube Data API.
 * @returns A promise that resolves to an array of Video objects or throws an error.
 */
export async function getLatestVideos(channel: Channel, apiKey: string): Promise<Video[]> {
  if (!apiKey) {
    throw new Error('YouTube API key is required.');
  }
  if (!channel || !channel.id) {
    throw new Error('Valid Channel ID is required.');
  }

  const url = `${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channel.id}&maxResults=${MAX_RESULTS_PER_CHANNEL}&order=date&type=video&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('YouTube API Error:', data);
      const errorMessage = data.error?.message || `Failed to fetch videos for channel ${channel.id}. Status: ${response.status}`;
      throw new Error(errorMessage);
    }

    if (!data.items) {
      console.warn(`No video items found for channel ${channel.id}`);
      return [];
    }

    // Map API response to our Video type
    const videos: Video[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
    }));

    return videos;

  } catch (error) {
    console.error(`Error fetching videos for channel ${channel.id}:`, error);
    // Re-throw the error or return an empty array depending on desired handling
    if (error instanceof Error) {
      throw new Error(`Network or parsing error fetching videos for channel ${channel.id}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching videos for channel ${channel.id}.`);
  }
}

/**
 * Fetches channel details (like name) for a given channel ID.
 *
 * @param channelId The ID of the YouTube channel.
 * @param apiKey The YouTube API Key.
 * @returns A promise resolving to the Channel object with name, or null if not found/error.
 */
export async function getChannelDetails(channelId: string, apiKey: string): Promise<Channel | null> {
   if (!apiKey) {
    console.error('API Key missing for getChannelDetails');
    return null;
  }
   if (!channelId) {
    console.error('Channel ID missing for getChannelDetails');
    return null;
  }

  const url = `${YOUTUBE_API_BASE_URL}/channels?part=snippet&id=${channelId}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.items || data.items.length === 0) {
      console.error(`Failed to fetch details for channel ${channelId}:`, data.error?.message || `Status ${response.status}`);
      return null;
    }

    const snippet = data.items[0].snippet;
    return {
      id: channelId,
      name: snippet.title,
    };
  } catch (error) {
    console.error(`Error fetching channel details for ${channelId}:`, error);
    return null;
  }
}
