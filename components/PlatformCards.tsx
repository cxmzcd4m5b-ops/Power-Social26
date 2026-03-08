"use client";

import { Facebook, Youtube, Instagram, ChevronRight } from "lucide-react";
import { useState } from "react";
import PlatformDetailModal from "./PlatformDetailModal";
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
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platforms[0] | null>(null);

  const copyToClipboard = async (text: string, platform: Platform) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const platforms = [
    {
      name: "TikTok",
      key: "tiktok" as Platform,
      icon: "🎵",
      color: "from-gray-900 to-gray-700",
      data: content.tiktok,
    },
    {
      name: "Instagram",
      key: "instagram" as Platform,
      icon: <Instagram className="w-8 h-8" />,
      color: "from-pink-600 to-purple-600",
      data: content.instagram,
    },
    {
      name: "Facebook",
      key: "facebook" as Platform,
      icon: <Facebook className="w-8 h-8" />,
      color: "from-blue-600 to-blue-800",
      data: content.facebook,
    },
    {
      name: "YouTube",
      key: "youtube" as Platform,
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
          <button
            key={platform.name}
            type="button"
            onClick={() => setSelectedPlatform(platform)}
            className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 overflow-hidden text-left hover:shadow-2xl hover:border-amber-400 hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <div
              className={`bg-gradient-to-r ${platform.color} p-6 text-white flex items-center justify-between`}
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl">{platform.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold">{platform.name}</h3>
                  <p className="text-sm opacity-90">{platform.data.format}</p>
                </div>
              </div>
              <ChevronRight className="w-8 h-8 opacity-80" />
            </div>
          </button>
        ))}
      </div>

      {selectedPlatform && (
        <PlatformDetailModal
          platformName={selectedPlatform.name}
          platformKey={selectedPlatform.key}
          color={selectedPlatform.color}
          icon={selectedPlatform.icon}
          data={selectedPlatform.data}
          uploadedFile={uploadedFile}
          onClose={() => setSelectedPlatform(null)}
          onCopy={(text) =>
            copyToClipboard(text, selectedPlatform.key)
          }
          copied={copiedPlatform === selectedPlatform.key}
        />
      )}
    </div>
  );
}
