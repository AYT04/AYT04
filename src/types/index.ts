export interface Channel {
  id: string;
  name?: string; // Optional: Can be fetched or user-defined
}

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string; // Optional: Add thumbnail URL
  publishedAt?: string; // Optional: Add published date/time string
  channelId: string; // Keep track of which channel it belongs to
  channelTitle?: string; // Optional: Add channel title
}
