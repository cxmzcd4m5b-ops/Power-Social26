"use client";

import { useRef, useEffect, useState } from "react";
import { Download, Play, Image as ImageIcon, Loader2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { getMusicUrl } from "@/lib/musicLibrary";

interface VideoPreviewProps {
  videoSrc: string;
  caption: string;
  platform: "tiktok" | "instagram" | "facebook" | "youtube";
  hashtags: string[];
  musicSuggestion?: string;
}

export default function VideoPreview({
  videoSrc,
  caption,
  platform,
  hashtags,
  musicSuggestion,
}: VideoPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  const platformSpecs = {
    tiktok: { width: 1080, height: 1920, name: "TikTok", duration: 21 },
    instagram: { width: 1080, height: 1920, name: "Instagram", duration: 45 },
    facebook: { width: 1080, height: 1080, name: "Facebook", duration: 90 },
    youtube: { width: 1080, height: 1920, name: "YouTube", duration: 45 },
  };

  const spec = platformSpecs[platform];

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on("log", ({ message }) => {
          console.log(message);
        });

        ffmpeg.on("progress", ({ progress: prog }) => {
          setProgress(Math.round(prog * 100));
        });

        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });

        setIsFFmpegLoaded(true);
      } catch (error) {
        console.error("Failed to load FFmpeg:", error);
      }
    };

    loadFFmpeg();
  }, []);

  // Generate thumbnail from first frame
  useEffect(() => {
    const generateThumbnail = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      video.currentTime = 1; // Get frame at 1 second

      video.onseeked = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = spec.width;
        canvas.height = spec.height;

        // Fill background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate video scaling
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (videoAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = video.videoWidth * (canvas.height / video.videoHeight);
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = video.videoHeight * (canvas.width / video.videoWidth);
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        // Draw video frame
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Add overlay and text (same as ImagePreview)
        const gradient = ctx.createLinearGradient(0, canvas.height - 400, 0, canvas.height);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - 400, canvas.width, 400);

        // Draw caption
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";

        const words = caption.split(" ");
        const lines: string[] = [];
        let currentLine = "";
        const maxWidth = canvas.width - 100;

        words.forEach((word) => {
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

        const lineHeight = 60;
        const startY = canvas.height - 300;
        lines.slice(0, 4).forEach((line, index) => {
          ctx.fillText(line.trim(), canvas.width / 2, startY + index * lineHeight);
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

        setThumbnailUrl(canvas.toDataURL("image/jpeg", 0.95));
      };
    };

    if (videoSrc) {
      generateThumbnail();
    }
  }, [videoSrc, caption, hashtags, platform, spec]);

  // Process video with FFmpeg
  const processVideo = async () => {
    if (!ffmpegRef.current || !isFFmpegLoaded) {
      alert("FFmpeg is still loading. Please wait a moment and try again.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("Loading video...");

    try {
      const ffmpeg = ffmpegRef.current;

      // Fetch input video
      setProgressMessage("Preparing video...");
      const videoData = await fetchFile(videoSrc);
      await ffmpeg.writeFile("input.mp4", videoData);

      // Fetch music
      setProgressMessage("Adding music...");
      const musicUrl = await getMusicUrl(musicSuggestion);
      const musicData = await fetchFile(musicUrl);
      await ffmpeg.writeFile("music.mp3", musicData);

      // Build FFmpeg command for video processing
      setProgressMessage("Processing video with captions...");
      
      const words = caption.split(" ").slice(0, 10); // Limit to first 10 words
      const wordDuration = 0.4; // seconds per word
      
      // Create animated text overlays
      let textFilters = words.map((word, index) => {
        const startTime = index * wordDuration;
        const endTime = startTime + wordDuration;
        const fadeTime = 0.2;
        
        return `drawtext=text='${word.replace(/'/g, "\\'")}':fontfile=/path/to/font:fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-200:enable='between(t,${startTime},${endTime})':alpha='if(lt(t,${startTime+fadeTime}),(t-${startTime})/${fadeTime},1)'`;
      }).join(",");

      // Simplified approach: Add static text and music
      const outputArgs = [
        "-i", "input.mp4",
        "-i", "music.mp3",
        "-filter_complex",
        `[0:v]scale=${spec.width}:${spec.height}:force_original_aspect_ratio=increase,crop=${spec.width}:${spec.height},drawtext=text='${caption.slice(0, 50).replace(/'/g, "\\'")}...':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-150:box=1:boxcolor=black@0.5:boxborderw=10[v];[1:a]volume=0.3[a1];[0:a][a1]amix=inputs=2:duration=shortest[a]`,
        "-map", "[v]",
        "-map", "[a]",
        "-t", String(spec.duration),
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-c:a", "aac",
        "-shortest",
        "output.mp4"
      ];

      setProgressMessage("Rendering final video...");
      await ffmpeg.exec(outputArgs);

      setProgressMessage("Finalizing...");
      const data = await ffmpeg.readFile("output.mp4");
      const videoBlob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(videoBlob);
      
      setProcessedVideoUrl(url);
      setProgressMessage("Complete!");
      
    } catch (error) {
      console.error("Video processing error:", error);
      setProgressMessage("Processing failed. Thumbnail still available.");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const downloadThumbnail = () => {
    if (!thumbnailUrl) return;
    const link = document.createElement("a");
    link.download = `creative-living-cabins-${platform}-thumbnail.jpg`;
    link.href = thumbnailUrl;
    link.click();
  };

  const downloadVideo = () => {
    if (!processedVideoUrl) return;
    const link = document.createElement("a");
    link.download = `creative-living-cabins-${platform}.mp4`;
    link.href = processedVideoUrl;
    link.click();
  };

  return (
    <div className="space-y-3">
      {/* Hidden video element for thumbnail extraction */}
      <video
        ref={videoRef}
        src={videoSrc}
        className="hidden"
        crossOrigin="anonymous"
      />
      
      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Thumbnail Preview */}
      {thumbnailUrl && (
        <div className="space-y-2">
          <h5 className="text-sm font-bold text-amber-900">📸 Thumbnail Preview</h5>
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="w-full rounded-lg shadow-lg border-2 border-gray-200"
            style={{ maxHeight: "400px", objectFit: "contain" }}
          />
          <button
            onClick={downloadThumbnail}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            <ImageIcon className="w-4 h-4" />
            Download Thumbnail
          </button>
        </div>
      )}

      {/* Video Processing */}
      <div className="space-y-2">
        <h5 className="text-sm font-bold text-amber-900">🎬 Video with Captions & Music</h5>
        
        {!processedVideoUrl && !isProcessing && (
          <button
            onClick={processVideo}
            disabled={!isFFmpegLoaded}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            {isFFmpegLoaded ? "Generate Video with Music" : "Loading FFmpeg..."}
          </button>
        )}

        {isProcessing && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span className="text-sm font-medium text-amber-900">{progressMessage}</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-3">
              <div
                className="bg-amber-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-amber-700 text-center">{progress}%</p>
          </div>
        )}

        {processedVideoUrl && (
          <div className="space-y-2">
            <video
              src={processedVideoUrl}
              controls
              className="w-full rounded-lg shadow-lg border-2 border-gray-200"
              style={{ maxHeight: "400px" }}
            />
            <button
              onClick={downloadVideo}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Download className="w-5 h-5" />
              Download {spec.name} Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
