"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import PlatformCards from "./PlatformCards";
import type { GeneratedContent } from "@/types";

interface ContentGeneratorProps {
  files: Array<{
    file: File;
    preview: string;
    type: "video" | "image";
  }>;
}

export default function ContentGenerator({ files }: ContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate captions and content
      const formData = new FormData();
      files.forEach((f) => {
        formData.append("files", f.file);
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data: GeneratedContent = await response.json();
      setGeneratedContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || files.length === 0}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 mx-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Analyzing & Creating Content...
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

      {generatedContent && <PlatformCards content={generatedContent} uploadedFile={files[0]} />}
    </div>
  );
}

