"use client";

import { useState } from "react";
import { Sparkles, Loader2, Layers, ImageIcon, Film } from "lucide-react";
import PlatformCards from "./PlatformCards";
import type { GeneratedContent } from "@/types";

type MultiMode = "individual" | "combined";

interface UploadedFile {
  file: File;
  preview: string;
  type: "video" | "image";
}

interface ContentGeneratorProps {
  files: UploadedFile[];
}

export default function ContentGenerator({ files }: ContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [multiMode, setMultiMode] = useState<MultiMode>("individual");
  const [activeTab, setActiveTab] = useState(0);

  // Individual mode: one GeneratedContent per file
  const [individualResults, setIndividualResults] = useState<
    Array<{ content: GeneratedContent; file: UploadedFile }>
  >([]);

  // Combined reel mode: one GeneratedContent + slideshow video
  const [combinedContent, setCombinedContent] = useState<GeneratedContent | null>(null);
  const [slideshowUrl, setSlideshowUrl] = useState<string>("");
  const [slideshowFile, setSlideshowFile] = useState<UploadedFile | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState("");

  const hasMultipleImages = files.length > 1 && files.every((f) => f.type === "image");
  const hasResults = individualResults.length > 0 || combinedContent !== null;

  const generateForFile = async (f: UploadedFile): Promise<GeneratedContent> => {
    const formData = new FormData();
    formData.append("files", f.file);
    const response = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to generate content");
    return response.json();
  };

  const handleGenerate = async (): Promise<void> => {
    setIsGenerating(true);
    setError(null);
    setIndividualResults([]);
    setCombinedContent(null);
    setSlideshowUrl("");
    setSlideshowFile(null);
    setActiveTab(0);

    try {
      if (hasMultipleImages && multiMode === "individual") {
        // Generate separate content per image
        const results: Array<{ content: GeneratedContent; file: UploadedFile }> = [];
        for (let i = 0; i < files.length; i++) {
          setProgressMessage(`Analyzing image ${i + 1} of ${files.length}...`);
          const content = await generateForFile(files[i]);
          results.push({ content, file: files[i] });
        }
        setIndividualResults(results);
      } else if (hasMultipleImages && multiMode === "combined") {
        // Generate one unified caption set + create slideshow
        setProgressMessage("Analyzing all images...");
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f.file));
        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to generate content");
        const data: GeneratedContent = await response.json();
        setCombinedContent(data);

        // Create slideshow video
        setProgressMessage("Creating slideshow reel...");
        const slideshowForm = new FormData();
        files.forEach((f) => slideshowForm.append("files", f.file));
        slideshowForm.append("platform", "tiktok");
        slideshowForm.append("durationPerImage", "4");

        const slideshowRes = await fetch("/api/create-slideshow", {
          method: "POST",
          body: slideshowForm,
        });
        if (slideshowRes.ok) {
          const slideshowData = await slideshowRes.json();
          const url = `${window.location.origin}${slideshowData.videoUrl}`;
          setSlideshowUrl(url);

          // Fetch the video as a File so it can be passed to VideoPreview
          const videoBlob = await fetch(url).then((r) => r.blob());
          const videoFile = new File([videoBlob], "slideshow.mp4", { type: "video/mp4" });
          setSlideshowFile({
            file: videoFile,
            preview: url,
            type: "video",
          });
        }
      } else {
        // Single file (existing behaviour)
        setProgressMessage("Analyzing content...");
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f.file));
        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to generate content");
        const data: GeneratedContent = await response.json();
        setIndividualResults([{ content: data, file: files[0] }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg === "Failed to fetch") {
        setError(
          "Network error. Ensure the dev server is running (npm run dev), OPENAI_API_KEY is set in .env, and try again."
        );
      } else {
        setError(msg);
      }
    } finally {
      setIsGenerating(false);
      setProgressMessage("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode selector for multiple images */}
      {hasMultipleImages && !hasResults && (
        <div className="bg-white border-2 border-amber-200 rounded-xl p-5 max-w-lg mx-auto">
          <h3 className="text-sm font-bold text-amber-900 mb-3 text-center">
            Multiple images detected - choose a mode
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMultiMode("individual")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                multiMode === "individual"
                  ? "border-amber-600 bg-amber-50 text-amber-900"
                  : "border-gray-200 bg-white text-gray-600 hover:border-amber-300"
              }`}
            >
              <ImageIcon className="w-6 h-6" />
              <span className="font-bold">Individual Posts</span>
              <span className="text-xs text-center opacity-75">Separate caption per image</span>
            </button>
            <button
              type="button"
              onClick={() => setMultiMode("combined")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                multiMode === "combined"
                  ? "border-amber-600 bg-amber-50 text-amber-900"
                  : "border-gray-200 bg-white text-gray-600 hover:border-amber-300"
              }`}
            >
              <Film className="w-6 h-6" />
              <span className="font-bold">Combined Reel</span>
              <span className="text-xs text-center opacity-75">Slideshow video from all images</span>
            </button>
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || files.length === 0}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 mx-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              {progressMessage || "Analyzing & Creating Content..."}
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              Generate Social Media Content
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Individual Posts: tabbed results */}
      {individualResults.length > 0 && (
        <div>
          {individualResults.length > 1 && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              {individualResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all shrink-0 ${
                    activeTab === idx
                      ? "border-amber-600 bg-amber-50 text-amber-900"
                      : "border-gray-200 bg-white text-gray-600 hover:border-amber-300"
                  }`}
                >
                  <img
                    src={result.file.preview}
                    alt={`Image ${idx + 1}`}
                    className="w-8 h-8 rounded object-cover"
                  />
                  Image {idx + 1}
                </button>
              ))}
            </div>
          )}
          <PlatformCards
            content={individualResults[activeTab].content}
            uploadedFile={individualResults[activeTab].file}
          />
        </div>
      )}

      {/* Combined Reel: slideshow preview + platform cards */}
      {combinedContent && (
        <div>
          {slideshowUrl && (
            <div className="mb-6 bg-white border-2 border-amber-200 rounded-xl p-5">
              <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Slideshow Reel Preview
              </h3>
              <div className="relative max-w-md mx-auto aspect-[9/16] rounded-lg overflow-hidden bg-black">
                <video
                  src={slideshowUrl}
                  controls
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>
          )}
          <PlatformCards
            content={combinedContent}
            uploadedFile={slideshowFile ?? files[0]}
          />
        </div>
      )}
    </div>
  );
}

