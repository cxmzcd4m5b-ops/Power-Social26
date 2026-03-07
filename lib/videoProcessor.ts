import ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import fs from 'fs';

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export interface VideoProcessingOptions {
  inputPath: string;
  outputPath: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube';
  caption?: string;
  music?: string;
}

export interface ImageToVideoOptions {
  imagePath: string;
  outputPath: string;
  duration: number;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube';
  caption?: string;
  music?: string;
}

const PLATFORM_SPECS = {
  tiktok: {
    width: 1080,
    height: 1920,
    maxDuration: 60,
    minDuration: 15,
    fps: 30,
  },
  instagram: {
    width: 1080,
    height: 1920,
    maxDuration: 90,
    minDuration: 15,
    fps: 30,
  },
  facebook: {
    width: 1080,
    height: 1080,
    maxDuration: 180,
    minDuration: 30,
    fps: 30,
  },
  youtube: {
    width: 1080,
    height: 1920,
    maxDuration: 60,
    minDuration: 15,
    fps: 30,
  },
};

export class VideoProcessor {
  /**
   * Convert image to video with zoom effect
   */
  static async imageToVideo(options: ImageToVideoOptions): Promise<string> {
    const { imagePath, outputPath, duration, platform, caption } = options;
    const specs = PLATFORM_SPECS[platform];

    return new Promise((resolve, reject) => {
      const command = ffmpeg(imagePath)
        .loop(duration)
        .fps(specs.fps)
        .size(`${specs.width}x${specs.height}`)
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          '-t ' + duration,
          // Ken Burns zoom effect
          `-vf "scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height},zoompan=z='min(zoom+0.0015,1.5)':d=${duration * specs.fps}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${specs.width}x${specs.height}:fps=${specs.fps}"`,
        ]);

      command
        .on('end', () => resolve(outputPath))
        .on('error', (err: Error) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Process video: trim, crop, and optimize for platform
   */
  static async processVideo(options: VideoProcessingOptions): Promise<string> {
    const { inputPath, outputPath, platform } = options;
    const specs = PLATFORM_SPECS[platform];

    return new Promise((resolve, reject) => {
      // Get video info first
      ffmpeg.ffprobe(inputPath, (err: Error | null, metadata: any) => {
        if (err) return reject(err);

        const duration = metadata.format.duration || 0;
        const targetDuration = Math.min(duration, specs.maxDuration);

        const command = ffmpeg(inputPath)
          .fps(specs.fps)
          .size(`${specs.width}x${specs.height}`)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-pix_fmt yuv420p',
            '-preset fast',
            '-crf 23',
            `-t ${targetDuration}`,
          ])
          // Crop to platform aspect ratio
          .videoFilters([
            `scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase`,
            `crop=${specs.width}:${specs.height}`,
          ]);

        command
          .on('progress', (progress: any) => {
            console.log(`Processing: ${Math.round(progress.percent || 0)}%`);
          })
          .on('end', () => resolve(outputPath))
          .on('error', (err: Error) => reject(err))
          .save(outputPath);
      });
    });
  }

  /**
   * Add text overlay to video
   */
  static async addTextOverlay(
    inputPath: string,
    outputPath: string,
    text: string,
    platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube'
  ): Promise<string> {
    const specs = PLATFORM_SPECS[platform];

    return new Promise((resolve, reject) => {
      const fontsize = platform === 'tiktok' ? 60 : 50;
      const textFilter = `drawtext=text='${text.replace(/'/g, "\\'")}':fontcolor=white:fontsize=${fontsize}:x=(w-text_w)/2:y=h-th-50:box=1:boxcolor=black@0.5:boxborderw=10`;

      ffmpeg(inputPath)
        .videoFilters(textFilter)
        .videoCodec('libx264')
        .audioCodec('copy')
        .outputOptions(['-pix_fmt yuv420p', '-preset fast'])
        .on('end', () => resolve(outputPath))
        .on('error', (err: Error) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Add background music to video
   */
  static async addMusic(
    inputPath: string,
    musicPath: string,
    outputPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .input(musicPath)
        .complexFilter([
          '[1:a]volume=0.3[music]',
          '[0:a][music]amix=inputs=2:duration=first[outa]',
        ])
        .outputOptions(['-map 0:v', '-map [outa]'])
        .videoCodec('copy')
        .audioCodec('aac')
        .on('end', () => resolve(outputPath))
        .on('error', (err: Error) => reject(err))
        .save(outputPath);
    });
  }

  /**
   * Get video metadata
   */
  static async getVideoInfo(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err: Error | null, metadata: any) => {
        if (err) return reject(err);
        resolve(metadata);
      });
    });
  }

  /**
   * Create all platform versions from single input
   */
  static async createAllPlatformVersions(
    inputPath: string,
    outputDir: string,
    isImage: boolean = false
  ): Promise<Record<string, string>> {
    const platforms = ['tiktok', 'instagram', 'facebook', 'youtube'] as const;
    const results: Record<string, string> = {};

    for (const platform of platforms) {
      const outputPath = path.join(
        outputDir,
        `${platform}_${Date.now()}.mp4`
      );

      if (isImage) {
        const duration = platform === 'facebook' ? 30 : 15;
        await this.imageToVideo({
          imagePath: inputPath,
          outputPath,
          duration,
          platform,
        });
      } else {
        await this.processVideo({
          inputPath,
          outputPath,
          platform,
        });
      }

      results[platform] = outputPath;
    }

    return results;
  }
}
