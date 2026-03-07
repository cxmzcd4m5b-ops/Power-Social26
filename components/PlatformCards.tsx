"use client";

import { Facebook, Youtube, Instagram } from "lucide-react";
import { useState } from "react";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import type { GeneratedContent, Platform } from "@/types";

interface UploadedFile {
  file: File;
  preview: string;
  type: "video" | "image";
}

interface PlatformCardsProps {
  content: GeneratedContent;
  uploadedImage?: string;
  uploadedFile?: UploadedFile;
}

export default function PlatformCards({ content, uploadedImage, uploadedFile }: PlatformCardsProps) {
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);

  const copyToClipboard = async (text: string, platform: Platform) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const platforms = [
    {
      name: "TikTok" as Platform,
      icon: "🎵",
      color: "from-gray-900 to-gray-700",
      data: content.tiktok,
    },
    {
      name: "Instagram" as Platform,
      icon: <Instagram className="w-8 h-8" />,
      color: "from-pink-600 to-purple-600",
      data: content.instagram,
    },
    {
      name: "Facebook" as Platform,
      icon: <Facebook className="w-8 h-8" />,
      color: "from-blue-600 to-blue-800",
      data: content.facebook,
    },
    {
      name: "YouTube" as Platform,
      icon: <Youtube className="w-8 h-8" />,
      color: "from-red-600 to-red-700",
      data: content.youtube,
    },
  ];

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-amber-900 mb-6 text-center">
        🎉 Your Content is Ready!
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden"
          >
            <div
              className={`bg-gradient-to-r ${platform.color} p-6 text-white flex items-center gap-3`}
            >
              <div className="text-4xl">{platform.icon}</div>
              <div>
                <h3 className="text-2xl font-bold">{platform.name}</h3>
                <p className="text-sm opacity-90">{platform.data.format}</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Visual Preview - Handle both video and image */}
              {uploadedFile && (
                <div className="mb-4">
                  <h4 className="font-bold text-amber-900 mb-2">📱 Preview</h4>
                  {uploadedFile.type === "video" ? (
                    <VideoPreview
                      videoSrc={uploadedFile.preview}
                      caption={platform.data.caption || ""}
                      platform={platform.name.toLowerCase() as "tiktok" | "instagram" | "facebook" | "youtube"}
                      hashtags={platform.data.hashtags || []}
                      musicSuggestion={platform.data.musicSuggestions?.[0]}
                    />
                  ) : (
                    <ImagePreview
                      imageSrc={uploadedFile.preview}
                      caption={platform.data.caption || ""}
                      platform={platform.name.toLowerCase() as "tiktok" | "instagram" | "facebook" | "youtube"}
                      hashtags={platform.data.hashtags || []}
                    />
                  )}
                </div>
              )}

              {platform.data.caption && (
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">📝 Caption</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {platform.data.caption}
                  </p>
                </div>
              )}

              {platform.data.hashtags && platform.data.hashtags.length > 0 && (
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">#️⃣ Hashtags</h4>
                  <p className="text-blue-600 text-sm">
                    {platform.data.hashtags.join(" ")}
                  </p>
                </div>
              )}

              {platform.data.musicSuggestions && platform.data.musicSuggestions.length > 0 && (
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">🎵 Music Suggestions</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {platform.data.musicSuggestions.map((music, idx) => (
                      <li key={idx}>• {music}</li>
                    ))}
                  </ul>
                </div>
              )}

              {platform.data.videoEdits && (
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">✂️ Video Edit Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {platform.data.videoEdits.map((edit, idx) => (
                      <li key={idx}>• {edit}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() =>
                  copyToClipboard(
                    `${platform.data.caption || ""}\n\n${platform.data.hashtags?.join(" ") || ""}`,
                    platform.name
                  )
                }
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  copiedPlatform === platform.name
                    ? "bg-green-500 text-white"
                    : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                }`}
              >
                {copiedPlatform === platform.name
                  ? "✓ Copied!"
                  : "Copy Caption & Hashtags"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
