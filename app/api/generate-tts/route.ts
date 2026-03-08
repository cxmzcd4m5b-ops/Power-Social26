import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile } from "fs/promises";
import path from "path";
import { existsSync, mkdirSync } from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Validate voice parameter
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const selectedVoice = validVoices.includes(voice) ? voice : "nova"; // Default to 'nova' (female)

    // Generate speech using OpenAI TTS
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      speed: 1.0,
    });

    // Save to file
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `tts_${Date.now()}.mp3`;
    const filePath = path.join(uploadsDir, filename);

    // Convert response to buffer and save
    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      audioPath: filePath,
      audioUrl: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("TTS generation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate speech",
      },
      { status: 500 }
    );
  }
}
