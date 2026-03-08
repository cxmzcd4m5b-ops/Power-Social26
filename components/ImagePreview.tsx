"use client";

import { useRef, useEffect, useState } from "react";
import { Download, Play, Loader2, Mic } from "lucide-react";

interface ImagePreviewProps {
  imageSrc: string;
  imageFile?: File;
  caption: string;
  platform: "tiktok" | "instagram" | "facebook" | "youtube";
  hashtags: string[];
  musicSuggestion?: string;
}

export default function ImagePreview({ imageSrc, imageFile, caption, platform, hashtags, musicSuggestion }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<"static" | "kenburns" | "fade">("kenburns");
  const [showTextOverlay, setShowTextOverlay] = useState(true);
  const [enableVoiceover, setEnableVoiceover] = useState(false);
  const [voiceoverIncludeHashtags, setVoiceoverIncludeHashtags] = useState(false);
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");

  const platformSpecs = {
    tiktok: { width: 1080, height: 1920, name: "TikTok" },
    instagram: { width: 1080, height: 1920, name: "Instagram" },
    facebook: { width: 1080, height: 1080, name: "Facebook" },
    youtube: { width: 1080, height: 1920, name: "YouTube" },
  };

  const spec = platformSpecs[platform];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // Set canvas size
      canvas.width = spec.width;
      canvas.height = spec.height;

      // Fill background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate image scaling to cover the canvas
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        // Image is wider
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      // Draw image
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Add dark overlay at bottom for text
      const gradient = ctx.createLinearGradient(0, canvas.height - 400, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 400, canvas.width, 400);

      // Draw caption text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 48px Arial";
      ctx.textAlign = "center";
      
      // Word wrap caption
      const words = caption.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      const maxWidth = canvas.width - 100;

      words.forEach(word => {
        const testLine = currentLine + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine !== "") {
          lines.push(currentLine);
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine);

      // Draw caption lines
      const lineHeight = 60;
      const startY = canvas.height - 300;
      lines.slice(0, 4).forEach((line, index) => {
        ctx.fillText(line.trim(), canvas.width / 2, startY + (index * lineHeight));
      });

      // Draw hashtags
      ctx.font = "36px Arial";
      ctx.fillStyle = "#4A9EFF";
      const hashtagText = hashtags.slice(0, 5).join(" ");
      ctx.fillText(hashtagText, canvas.width / 2, canvas.height - 80);

      // Draw platform badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(20, 20, 200, 60);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "left";
      ctx.fillText(spec.name, 40, 60);

      // Convert to URL for download
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.95));
    };
  }, [imageSrc, caption, hashtags, platform, spec]);

  // Process image to video via server API
  const processImage = async (useTrending = false, voiceoverOnly = false) => {
    if (!imageFile) {
      setProcessingError("Image file is required. Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setProgressMessage("Converting image to video...");
    setProcessingError(null);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("platform", platform);
      if (!voiceoverOnly) {
        if (musicSuggestion && !useTrending) formData.append("musicSuggestion", musicSuggestion);
        if (useTrending) formData.append("trendingMusic", "true");
      }
      formData.append("caption", caption);
      formData.append("hashtags", JSON.stringify(hashtags));
      formData.append("animationType", animationType);
      formData.append("enableVoiceover", (enableVoiceover || voiceoverOnly) ? "true" : "false");
      formData.append("voiceoverIncludeHashtags", voiceoverIncludeHashtags ? "true" : "false");
      formData.append("voiceGender", voiceGender);
      if (voiceoverOnly) formData.append("voiceoverOnly", "true");

      const label = voiceoverOnly
        ? "Processing image with voiceover only..."
        : `Processing image with ${useTrending ? 'trending' : 'AI-suggested'} music${enableVoiceover ? ' and voiceover' : ''}...`;
      setProgressMessage(label);
      const res = await fetch("/api/process-image-to-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Processing failed");
      }

      const videoUrl = `${window.location.origin}${data.videoUrl}`;
      setProcessedVideoUrl(videoUrl);
      setProgressMessage("Complete!");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Image to video processing error:", error);
      setProcessingError(`Processing failed: ${message}`);
      setProgressMessage("Processing failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `creative-living-cabins-${platform}.jpg`;
    link.href = previewUrl;
    link.click();
  };

  const downloadVideo = () => {
    if (!processedVideoUrl) return;
    const link = document.createElement("a");
    link.download = `creative-living-cabins-${platform}-video.mp4`;
    link.href = processedVideoUrl;
    link.click();
  };

  const isSquare = platform === "facebook";

  return (
    <div className="space-y-3">
      {/* Static Image Preview */}
      <div className="space-y-2">
        <h5 className="text-sm font-bold text-amber-900">Static Image Preview</h5>
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg shadow-lg border-2 border-gray-200"
          style={{ maxHeight: "500px", objectFit: "contain" }}
        />
        <button
          onClick={handleDownload}
          disabled={!previewUrl}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          Download {spec.name} Image
        </button>
      </div>

      {/* Video with Music Section */}
      {imageFile && (
        <div className="space-y-3 pt-4 border-t-2 border-amber-200">
          <h5 className="text-sm font-bold text-amber-900">Create Video with Music</h5>
          
          {/* Animation Type Selector */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Animation Style
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="animation"
                  value="kenburns"
                  checked={animationType === "kenburns"}
                  onChange={(e) => setAnimationType(e.target.value as "kenburns")}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-amber-900">Ken Burns (Zoom)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="animation"
                  value="fade"
                  checked={animationType === "fade"}
                  onChange={(e) => setAnimationType(e.target.value as "fade")}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-amber-900">Fade In/Out</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="animation"
                  value="static"
                  checked={animationType === "static"}
                  onChange={(e) => setAnimationType(e.target.value as "static")}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-amber-900">Static (No Animation)</span>
              </label>
            </div>
          </div>

          {/* Music Generation Buttons */}
          {processingError && (
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {processingError}
            </div>
          )}
          
          {/* Voiceover Controls */}
          {!processedVideoUrl && !isProcessing && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 space-y-3">
              <h5 className="text-sm font-bold text-purple-900">🎤 Voiceover Options (Optional)</h5>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableVoiceover}
                    onChange={(e) => setEnableVoiceover(e.target.checked)}
                    className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-purple-900">Add AI voiceover to video</span>
                </label>
                {enableVoiceover && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer ml-6">
                      <input
                        type="checkbox"
                        checked={voiceoverIncludeHashtags}
                        onChange={(e) => setVoiceoverIncludeHashtags(e.target.checked)}
                        className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-purple-900">Include hashtags in voiceover</span>
                    </label>
                    <div className="ml-6 flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="voiceGender"
                          value="female"
                          checked={voiceGender === "female"}
                          onChange={(e) => setVoiceGender("female")}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-purple-900">Female voice</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="voiceGender"
                          value="male"
                          checked={voiceGender === "male"}
                          onChange={(e) => setVoiceGender("male")}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-purple-900">Male voice</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          {!processedVideoUrl && !isProcessing && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => processImage(false)}
                disabled={!imageFile}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Play className="w-4 h-4" />
                Video with Music
              </button>
              <button
                onClick={() => processImage(true)}
                disabled={!imageFile}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Play className="w-4 h-4" />
                Trending Music
              </button>
              <button
                onClick={() => processImage(false, true)}
                disabled={!imageFile}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white py-3 rounded-lg font-bold hover:from-sky-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Mic className="w-4 h-4" />
                Voiceover Only
              </button>
            </div>
          )}
          {isProcessing && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-5 h-5 shrink-0 animate-spin text-amber-600" />
              <span className="text-sm font-medium text-amber-900">{progressMessage}</span>
            </div>
          )}

          {/* Processed Video Player */}
          {processedVideoUrl && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h5 className="text-sm font-bold text-amber-900">Video with Music Preview</h5>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-amber-900">
                    <input
                      type="checkbox"
                      checked={showTextOverlay}
                      onChange={(e) => setShowTextOverlay(e.target.checked)}
                      className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    Show text overlay
                  </label>
                  <button
                    onClick={downloadVideo}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              <div
                className={`relative w-full max-h-[400px] overflow-hidden rounded-lg shadow-lg border-2 border-gray-200 bg-black ${
                  isSquare ? "aspect-square" : "aspect-[9/16]"
                }`}
              >
                <video
                  ref={videoRef}
                  src={processedVideoUrl}
                  controls
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {showTextOverlay && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 bottom-14 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent pb-2 pt-12 px-4">
                    <div className="absolute left-3 top-3 rounded-lg bg-white/20 px-3 py-1.5">
                      <span className="text-sm font-bold text-white">{spec.name}</span>
                    </div>
                    <p className="mb-2 line-clamp-4 text-center text-sm font-bold leading-snug text-white drop-shadow-lg sm:text-base">
                      {caption}
                    </p>
                    <p className="text-center text-xs text-blue-400 drop-shadow-md sm:text-sm">
                      {hashtags.slice(0, 5).join(" ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
