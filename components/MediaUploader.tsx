"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, Film, Image as ImageIcon, Loader2 } from "lucide-react";
import ContentGenerator from "./ContentGenerator";

interface UploadedFile {
  file: File;
  preview: string;
  type: "video" | "image";
}

export default function MediaUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? ("video" as const) : ("image" as const),
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-amber-600 bg-amber-100 scale-105"
            : "border-amber-300 bg-white hover:border-amber-500 hover:bg-amber-50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {isUploading ? (
            <Loader2 className="w-16 h-16 text-amber-600 animate-spin" />
          ) : (
            <Upload className="w-16 h-16 text-amber-600" />
          )}
          <div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">
              {isDragActive ? "Drop your files here" : "Upload Your Content"}
            </h3>
            <p className="text-amber-700">
              Drag and drop videos or images, or click to browse
            </p>
            <p className="text-sm text-amber-600 mt-2">
              Supports: MP4, MOV, JPG, PNG
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            Uploaded Files ({uploadedFiles.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="relative bg-white rounded-lg overflow-hidden shadow-lg border-2 border-amber-200"
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {file.type === "video" ? (
                    <video
                      src={file.preview}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <Image
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                      width={400}
                      height={300}
                      unoptimized
                    />
                  )}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {file.type === "video" ? (
                      <Film className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="text-sm font-medium text-amber-900 truncate">
                      {file.file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 font-bold text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <ContentGenerator files={uploadedFiles} />
        </div>
      )}
    </div>
  );
}
