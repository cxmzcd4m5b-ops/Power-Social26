// Royalty-free music library for Creative Living Cabins content
// These are placeholder URLs - replace with actual royalty-free tracks

export interface MusicTrack {
  name: string;
  url: string;
  genre: string;
  mood: string;
}

// Curated royalty-free music tracks
const musicTracks: MusicTrack[] = [
  {
    name: "Chill Vibes - Prod. by Rose",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_2c0e8b2b02.mp3",
    genre: "ambient",
    mood: "calm"
  },
  {
    name: "Inspiring Cinematic Background",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    genre: "cinematic",
    mood: "inspiring"
  },
  {
    name: "Uplifting Motivation",
    url: "https://cdn.pixabay.com/audio/2022/08/02/audio_d1718ab41b.mp3",
    genre: "upbeat",
    mood: "energetic"
  },
  {
    name: "Acoustic Folk",
    url: "https://cdn.pixabay.com/audio/2022/03/24/audio_1d0450c2eb.mp3",
    genre: "folk",
    mood: "warm"
  },
  {
    name: "Peaceful Ambiance",
    url: "https://cdn.pixabay.com/audio/2021/08/09/audio_a323f17be5.mp3",
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
  if (lowerSuggestion.includes('upbeat') || lowerSuggestion.includes('energetic')) {
    return musicTracks.find(t => t.mood === 'energetic')?.url || musicTracks[2].url;
  }
  if (lowerSuggestion.includes('calm') || lowerSuggestion.includes('chill')) {
    return musicTracks.find(t => t.mood === 'calm')?.url || musicTracks[0].url;
  }
  if (lowerSuggestion.includes('inspiring') || lowerSuggestion.includes('motivation')) {
    return musicTracks.find(t => t.mood === 'inspiring')?.url || musicTracks[1].url;
  }
  if (lowerSuggestion.includes('acoustic') || lowerSuggestion.includes('folk')) {
    return musicTracks.find(t => t.genre === 'folk')?.url || musicTracks[3].url;
  }

  // Default fallback
  return musicTracks[0].url;
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
