import { NextRequest, NextResponse } from "next/server";
import { VideoProcessor } from "@/lib/videoProcessor";
import { getMusicUrl, getTrendingMusicUrl } from "@/lib/musicLibrary";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const platform = formData.get("platform") as string | null;
    const musicSuggestion = formData.get("musicSuggestion") as string | null;
    const trendingMusic = formData.get("trendingMusic") as string | null;
    const caption = formData.get("caption") as string | null;
    const hashtagsRaw = formData.get("hashtags") as string | null;
    const animationType = formData.get("animationType") as string | null;
    
    let hashtags: string[] = [];
    if (hashtagsRaw) {
      try {
        hashtags = JSON.parse(hashtagsRaw) as string[];
      } catch {
        hashtags = [];
      }
    }

    if (!file || !platform) {
      return NextResponse.json(
        { error: "Missing file or platform" },
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

    // Save uploaded image
    const inputFilename = `image_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const inputPath = path.join(uploadsDir, inputFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Convert image to video first
    const tempVideoFilename = `temp_video_${Date.now()}.mp4`;
    const tempVideoPath = path.join(uploadsDir, tempVideoFilename);

    // Platform-specific durations
    const platformDurations: Record<string, number> = {
      tiktok: 21,
      instagram: 45,
      facebook: 30,
      youtube: 45,
    };

    const duration = platformDurations[platform] || 30;

    await VideoProcessor.imageToVideo({
      imagePath: inputPath,
      outputPath: tempVideoPath,
      duration,
      platform: platform as "tiktok" | "instagram" | "facebook" | "youtube",
      animation: (animationType as "static" | "kenburns" | "fade") || "kenburns",
    });

    // Get music URL based on trending flag or AI suggestion
    let musicUrl: string;
    if (trendingMusic === "true") {
      musicUrl = await getTrendingMusicUrl(platform as "tiktok" | "instagram" | "facebook" | "youtube");
    } else {
      musicUrl = await getMusicUrl(musicSuggestion || undefined);
    }

    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "audio/mpeg,audio/*,*/*",
    };
    let musicResponse = await fetch(musicUrl, { headers: fetchHeaders });
    
    // Fallback to first track if primary URL fails
    if (!musicResponse.ok && (musicSuggestion || trendingMusic)) {
      const { getAllTracks } = await import("@/lib/musicLibrary");
      const fallbackUrl = getAllTracks()[0]?.url;
      if (fallbackUrl && fallbackUrl !== musicUrl) {
        musicResponse = await fetch(fallbackUrl, { headers: fetchHeaders });
      }
    }
    
    if (!musicResponse.ok) {
      await unlink(inputPath).catch(() => {});
      await unlink(tempVideoPath).catch(() => {});
      return NextResponse.json(
        { error: `Failed to download music (HTTP ${musicResponse.status})` },
        { status: 500 }
      );
    }
    
    const musicBuffer = Buffer.from(await musicResponse.arrayBuffer());
    const musicPath = path.join(uploadsDir, `music_${Date.now()}.mp3`);
    await writeFile(musicPath, musicBuffer);

    // Process video with music
    const outputFilename = `${platform}_${Date.now()}.mp4`;
    const outputPath = path.join(generatedDir, outputFilename);

    await VideoProcessor.processVideoWithMusic(
      tempVideoPath,
      musicPath,
      outputPath,
      platform as "tiktok" | "instagram" | "facebook" | "youtube",
      { caption: caption ?? undefined, hashtags }
    );

    // Cleanup temp files
    await unlink(inputPath).catch(() => {});
    await unlink(tempVideoPath).catch(() => {});
    await unlink(musicPath).catch(() => {});

    return NextResponse.json({
      success: true,
      videoUrl: `/generated/${outputFilename}`,
    });
  } catch (error) {
    console.error("Process image to video error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process image to video",
      },
      { status: 500 }
    );
  }
}
