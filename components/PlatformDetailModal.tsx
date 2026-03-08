"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import { CABIN_MODELS } from "@/lib/cabinModels";
import type { Platform } from "@/types";

interface UploadedFile {
  file: File;
  preview: string;
  type: "video" | "image";
}

interface PlatformContent {
  caption: string;
  captionVariants?: string[];
  hashtags: string[];
  musicSuggestions?: string[];
  format: string;
  videoEdits?: string[];
  bestPostingTimes?: string[];
}

interface PlatformDetailModalProps {
  platformName: string;
  platformKey: Platform;
  color: string;
  icon: React.ReactNode;
  data: PlatformContent;
  uploadedFile?: UploadedFile;
  onClose: () => void;
  onCopy: (text: string) => void;
  copied: boolean;
}

export default function PlatformDetailModal({
  platformName,
  platformKey,
  color,
  icon,
  data,
  uploadedFile,
  onClose,
  onCopy,
  copied,
}: PlatformDetailModalProps) {
  const [showDemoReel, setShowDemoReel] = useState(true);
  const captionOptions = data.captionVariants?.length
    ? data.captionVariants
    : [data.caption].filter(Boolean);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);
  const [selectedCabinNames, setSelectedCabinNames] = useState<string[]>([]);
  const activeCaption = captionOptions[selectedCaptionIndex] || data.caption || "";
  const displayCaption =
    activeCaption +
    (selectedCabinNames.length ? " | " + selectedCabinNames.join(", ") : "");

  const toggleCabin = (name: string) => {
    setSelectedCabinNames((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border-2 border-amber-200">
        <div className={`sticky top-0 bg-gradient-to-r ${color} p-6 text-white flex items-center justify-between z-10`}>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{icon}</div>
            <div>
              <h2 className="text-2xl font-bold">{platformName}</h2>
              <p className="text-sm opacity-90">{data.format}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {data.bestPostingTimes && data.bestPostingTimes.length > 0 && (
            <div>
              <h4 className="font-bold text-amber-900 mb-2">🕐 Best Time to Post</h4>
              <p className="text-gray-700 text-sm">
                {data.bestPostingTimes.join(", ")}
              </p>
            </div>
          )}

          {activeCaption && (
            <div>
              <h4 className="font-bold text-amber-900 mb-2">📝 Caption</h4>
              {captionOptions.length > 1 && (
                <div className="mb-2 flex gap-2">
                  {captionOptions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCaptionIndex(idx)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        selectedCaptionIndex === idx
                          ? "bg-amber-600 text-white"
                          : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-gray-700 whitespace-pre-wrap">{activeCaption}</p>
            </div>
          )}

          <div className="rounded-lg border-2 border-amber-200 bg-amber-50/50 p-3">
            <h4 className="font-bold text-amber-900 mb-2 text-sm">
              Add cabin names to overlay (optional)
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {CABIN_MODELS.map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-2 text-sm text-amber-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedCabinNames.includes(name)}
                    onChange={() => toggleCabin(name)}
                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  {name}
                </label>
              ))}
            </div>
          </div>

          {data.hashtags && data.hashtags.length > 0 && (
            <div>
              <h4 className="font-bold text-amber-900 mb-2">#️⃣ Hashtags</h4>
              <p className="text-blue-600 text-sm">{data.hashtags.join(" ")}</p>
            </div>
          )}

          {uploadedFile && (
            <div>
              <button
                onClick={() => setShowDemoReel(!showDemoReel)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg font-bold hover:from-amber-700 hover:to-orange-700 transition-all"
              >
                {showDemoReel ? "Hide Demo Reel" : "View Demo Reel"}
              </button>
              {showDemoReel && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-3">📱 Demo Reel Preview</h4>
                  {uploadedFile.type === "video" ? (
                    <VideoPreview
                      videoSrc={uploadedFile.preview}
                      videoFile={uploadedFile.file}
                      caption={displayCaption}
                      platform={platformKey}
                      hashtags={data.hashtags || []}
                      musicSuggestion={data.musicSuggestions?.[0]}
                    />
                  ) : (
                    <ImagePreview
                      imageSrc={uploadedFile.preview}
                      imageFile={uploadedFile.file}
                      caption={displayCaption}
                      platform={platformKey}
                      hashtags={data.hashtags || []}
                      musicSuggestion={data.musicSuggestions?.[0]}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {data.musicSuggestions && data.musicSuggestions.length > 0 && (
            <div>
              <h4 className="font-bold text-amber-900 mb-2">🎵 Music Suggestions</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {data.musicSuggestions.map((music, idx) => (
                  <li key={idx}>• {music}</li>
                ))}
              </ul>
            </div>
          )}

          {data.videoEdits && (
            <div>
              <h4 className="font-bold text-amber-900 mb-2">✂️ Video Edit Tips</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {data.videoEdits.map((edit, idx) => (
                  <li key={idx}>• {edit}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() =>
              onCopy(`${displayCaption}\n\n${data.hashtags?.join(" ") || ""}`)
            }
            className={`w-full py-3 rounded-lg font-bold transition-all ${
              copied ? "bg-green-500 text-white" : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
          >
            {copied ? "Copied!" : "Copy Caption & Hashtags"}
          </button>
        </div>
      </div>
    </div>
  );
}
