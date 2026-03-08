import { NextRequest, NextResponse } from "next/server";
import { VideoProcessor } from "@/lib/videoProcessor";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const savedPaths: string[] = [];

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const platform = (formData.get("platform") as string) || "tiktok";
    const durationPerImage = Number(formData.get("durationPerImage") || "4");

    if (files.length < 2) {
      return NextResponse.json(
        { error: "At least 2 images are required" },
        { status: 400 }
      );
    }

    const validPlatforms = ["tiktok", "instagram", "facebook", "youtube"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const generatedDir = path.join(process.cwd(), "public", "generated");

    if (!existsSync(uploadsDir)) await mkdir(uploadsDir, { recursive: true });
    if (!existsSync(generatedDir)) await mkdir(generatedDir, { recursive: true });

    // Save all uploaded images to disk
    const imagePaths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `slide_${Date.now()}_${i}_${safeName}`;
      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      imagePaths.push(filePath);
      savedPaths.push(filePath);
    }

    // Generate slideshow
    const outputFilename = `slideshow_${platform}_${Date.now()}.mp4`;
    const outputPath = path.join(generatedDir, outputFilename);

    await VideoProcessor.imagesToSlideshow({
      imagePaths,
      outputPath,
      platform: platform as "tiktok" | "instagram" | "facebook" | "youtube",
      durationPerImage,
    });

    // Cleanup uploaded images
    for (const p of savedPaths) {
      await unlink(p).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      videoUrl: `/generated/${outputFilename}`,
    });
  } catch (error) {
    // Cleanup on error
    for (const p of savedPaths) {
      await unlink(p).catch(() => {});
    }
    console.error("Create slideshow error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create slideshow",
      },
      { status: 500 }
    );
  }
}
