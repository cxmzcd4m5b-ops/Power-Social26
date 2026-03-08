// Royalty-free music library for Creative Living Cabins content
// These are placeholder URLs - replace with actual royalty-free tracks

export interface MusicTrack {
  name: string;
  url: string;
  genre: string;
  mood: string;
}

// Royalty-free music - SoundHelix (allows server-side fetch; Pixabay CDN blocks it)
const musicTracks: MusicTrack[] = [
  {
    name: "Chill Vibes",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    genre: "ambient",
    mood: "calm"
  },
  {
    name: "Inspiring Cinematic Background",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    genre: "cinematic",
    mood: "inspiring"
  },
  {
    name: "Uplifting Motivation",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    genre: "upbeat",
    mood: "energetic"
  },
  {
    name: "Acoustic Folk",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    genre: "folk",
    mood: "warm"
  },
  {
    name: "Peaceful Ambiance",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    genre: "ambient",
    mood: "peaceful"
  }
];

/**
 * Get music URL based on suggestion or fallback to default
 */
export const getMusicUrl = async (suggestion?: string): Promise<string> => {
  if (!suggestion) {
    return musicTracks[0].url; // Default track
  }

  // Try to match suggestion to available tracks
  const lowerSuggestion = suggestion.toLowerCase();
  
  // Match by name
  const exactMatch = musicTracks.find(track => 
    lowerSuggestion.includes(track.name.toLowerCase())
  );
  if (exactMatch) return exactMatch.url;

  // Match by mood/genre keywords
  if (lowerSuggestion.includes('upbeat') || lowerSuggestion.includes('energetic') || lowerSuggestion.includes('corporate')) {
    return musicTracks.find(t => t.mood === 'energetic')?.url || musicTracks[2].url;
  }
  if (lowerSuggestion.includes('calm') || lowerSuggestion.includes('chill') || lowerSuggestion.includes('relaxing') || lowerSuggestion.includes('nature')) {
    return musicTracks.find(t => t.mood === 'calm')?.url || musicTracks[0].url;
  }
  if (lowerSuggestion.includes('inspiring') || lowerSuggestion.includes('motivation') || lowerSuggestion.includes('piano')) {
    return musicTracks.find(t => t.mood === 'inspiring')?.url || musicTracks[1].url;
  }
  if (lowerSuggestion.includes('acoustic') || lowerSuggestion.includes('folk')) {
    return musicTracks.find(t => t.genre === 'folk')?.url || musicTracks[3].url;
  }

  // Default fallback
  return musicTracks[0].url;
};

/**
 * Get trending music URL based on platform
 * Maps platform-specific trending sounds to actual royalty-free tracks
 */
export const getTrendingMusicUrl = async (
  platform: "tiktok" | "instagram" | "facebook" | "youtube"
): Promise<string> => {
  // Platform-specific trending music mapping
  const trendingMap: Record<typeof platform, number> = {
    tiktok: 2,      // Uplifting Motivation (upbeat/energetic for viral content)
    instagram: 1,   // Inspiring Cinematic Background (aesthetic/inspiring)
    facebook: 3,    // Acoustic Folk (calm/warm for community engagement)
    youtube: 1,     // Inspiring Cinematic Background (motivational/educational)
  };

  const trackIndex = trendingMap[platform] || 0;
  return musicTracks[trackIndex].url;
};

/**
 * Get all available music tracks
 */
export const getAllTracks = (): MusicTrack[] => {
  return musicTracks;
};

/**
 * Download music file for offline use
 */
export const downloadMusicFile = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to download music file');
  }
  return await response.blob();
};
