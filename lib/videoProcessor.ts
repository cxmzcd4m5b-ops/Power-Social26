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
  animation?: 'static' | 'kenburns' | 'fade';
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
   * Convert image to video with optional animation effects
   */
  static async imageToVideo(options: ImageToVideoOptions): Promise<string> {
    const { imagePath, outputPath, duration, platform, caption, animation = 'kenburns' } = options;
    const specs = PLATFORM_SPECS[platform];

    return new Promise((resolve, reject) => {
      let videoFilter: string;

      // Build video filter based on animation type
      if (animation === 'static') {
        // Static: no animation, just scale and crop
        videoFilter = `scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height}`;
      } else if (animation === 'fade') {
        // Fade: fade in/out effects
        videoFilter = `scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height},fade=t=in:st=0:d=1,fade=t=out:st=${duration - 1}:d=1`;
      } else {
        // Ken Burns: zoom effect (default)
        videoFilter = `zoompan=z='min(zoom+0.0015,1.5)':d=${duration * specs.fps}:s=${specs.width}x${specs.height}:fps=${specs.fps},scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height}`;
      }

      const command = ffmpeg(imagePath)
        .inputOptions(['-loop 1'])
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          '-preset fast',
          '-crf 23',
          `-t ${duration}`,
          `-r ${specs.fps}`,
          `-vf ${videoFilter}`,
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
   * Process video: scale/crop to platform size, add music (5 sec past video end), and 5-sec text outro.
   * Optionally mix in TTS voiceover with music ducking.
   */
  static async processVideoWithMusic(
    inputPath: string,
    musicPath: string,
    outputPath: string,
    platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube',
    options?: { caption?: string; hashtags?: string[]; ttsPath?: string }
  ): Promise<string> {
    const specs = PLATFORM_SPECS[platform];
    const outroSeconds = 5;

    const metadata = await this.getVideoInfo(inputPath);
    const videoDuration = metadata?.format?.duration ?? 30;
    const cappedVideoDuration = Math.min(videoDuration, specs.maxDuration);
    const totalDuration = cappedVideoDuration + outroSeconds;

    const caption = options?.caption ?? '';
    const hashtags = options?.hashtags ?? [];
    const ttsPath = options?.ttsPath;
    const captionLine = (caption || 'Thanks for watching').slice(0, 80);
    const hashtagLine = hashtags.slice(0, 5).join(' ');
    const outroLine2 = hashtagLine ? hashtagLine.slice(0, 60) : '';
    const rawText = outroLine2 ? `${captionLine}\\n${outroLine2}` : captionLine;
    const escapedText = rawText
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'");

    const fontsize = platform === 'tiktok' ? 52 : 44;
    const drawtext = `drawtext=text='${escapedText}':fontcolor=white:fontsize=${fontsize}:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.6:boxborderw=12`;

    let filterComplex: string[];
    let inputMaps: string[];

    if (ttsPath) {
      // With TTS: duck music when voiceover plays, mix TTS + music
      filterComplex = [
        `[0:v]scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height},trim=duration=${cappedVideoDuration},setpts=PTS-STARTPTS,fps=${specs.fps}[vscaled]`,
        `color=c=black:s=${specs.width}x${specs.height}:d=${outroSeconds}:r=${specs.fps}[outro]`,
        `[outro]${drawtext}[outro_text]`,
        `[vscaled][outro_text]concat=n=2:v=1:a=0[outv]`,
        // TTS audio (trimmed to total duration)
        `[2:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS,volume=1.2[tts]`,
        // Music with ducking: lower volume when TTS is playing
        `[1:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS[music_full]`,
        `[music_full][tts]sidechaincompress=threshold=0.1:ratio=4:attack=200:release=1000,volume=0.5[music_ducked]`,
        // Mix TTS + ducked music
        `[music_ducked][tts]amix=inputs=2:duration=longest:weights=1 1.5[a]`,
      ];
      inputMaps = ['-map', '[outv]', '-map', '[a]'];
    } else {
      // No TTS: just music
      filterComplex = [
        `[0:v]scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height},trim=duration=${cappedVideoDuration},setpts=PTS-STARTPTS,fps=${specs.fps}[vscaled]`,
        `color=c=black:s=${specs.width}x${specs.height}:d=${outroSeconds}:r=${specs.fps}[outro]`,
        `[outro]${drawtext}[outro_text]`,
        `[vscaled][outro_text]concat=n=2:v=1:a=0[outv]`,
        `[1:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS,volume=0.3[a]`,
      ];
      inputMaps = ['-map', '[outv]', '-map', '[a]'];
    }

    return new Promise((resolve, reject) => {
      const cmd = ffmpeg()
        .input(inputPath)
        .input(musicPath);

      if (ttsPath) {
        cmd.input(ttsPath);
      }

      cmd.outputOptions([
          '-filter_complex', filterComplex.join(';'),
          ...inputMaps,
          '-t', String(totalDuration),
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
        ])
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
