import { NextRequest, NextResponse } from "next/server";
import { VideoProcessor } from "@/lib/videoProcessor";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const platform = formData.get("platform") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const outputDir = path.join(process.cwd(), 'public', 'generated');
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // Save uploaded file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name}`;
    const inputPath = path.join(uploadsDir, filename);
    await writeFile(inputPath, buffer);

    // Determine if it's an image or video
    const isImage = file.type.startsWith('image/');

    // Generate videos for all platforms
    console.log('Starting video generation...');
    const generatedVideos = await VideoProcessor.createAllPlatformVersions(
      inputPath,
      outputDir,
      isImage
    );

    // Convert file paths to URLs
    const videoUrls: Record<string, string> = {};
    for (const [platform, filePath] of Object.entries(generatedVideos)) {
      const filename = path.basename(filePath);
      videoUrls[platform] = `/generated/${filename}`;
    }

    return NextResponse.json({
      success: true,
      videos: videoUrls,
      message: isImage 
        ? 'Image converted to videos for all platforms' 
        : 'Video processed for all platforms',
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate videos",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
