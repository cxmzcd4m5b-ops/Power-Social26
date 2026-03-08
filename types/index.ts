export type Platform = "tiktok" | "instagram" | "facebook" | "youtube";

export interface PlatformContent {
  caption: string;
  captionVariants?: string[];
  hashtags: string[];
  musicSuggestions: string[];
  format: string;
  videoEdits?: string[];
  bestPostingTimes?: string[];
}

export interface GeneratedContent {
  tiktok: PlatformContent;
  instagram: PlatformContent;
  facebook: PlatformContent;
  youtube: PlatformContent;
  analysis: {
    scene: string;
    materials: string[];
    stage: string;
    keyMoments: string[];
  };
}
