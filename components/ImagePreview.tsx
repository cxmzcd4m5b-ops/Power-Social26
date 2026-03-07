"use client";

import { useRef, useEffect, useState } from "react";
import { Download } from "lucide-react";

interface ImagePreviewProps {
  imageSrc: string;
  caption: string;
  platform: "tiktok" | "instagram" | "facebook" | "youtube";
  hashtags: string[];
}

export default function ImagePreview({ imageSrc, caption, platform, hashtags }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `creative-living-cabins-${platform}.jpg`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <div className="space-y-3">
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
  );
}
