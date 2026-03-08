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

export interface SlideshowOptions {
  imagePaths: string[];
  outputPath: string;
  platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube';
  durationPerImage: number;
  transitionDuration?: number;
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
   * Combine multiple images into a slideshow video with mixed transitions.
   */
  static async imagesToSlideshow(options: SlideshowOptions): Promise<string> {
    const {
      imagePaths,
      outputPath,
      platform,
      durationPerImage,
      transitionDuration = 1,
    } = options;
    const specs = PLATFORM_SPECS[platform];
    const n = imagePaths.length;

    if (n === 0) throw new Error('No images provided');
    if (n === 1) {
      return this.imageToVideo({
        imagePath: imagePaths[0],
        outputPath,
        duration: durationPerImage,
        platform,
        animation: 'kenburns',
      });
    }

    const transitions = ['fade', 'slideright', 'slideleft', 'wiperight', 'dissolve'];
    const pick = (i: number): string => transitions[i % transitions.length];

    return new Promise((resolve, reject) => {
      const cmd = ffmpeg();

      // Add each image as a looping input
      for (const img of imagePaths) {
        cmd.input(img).inputOptions(['-loop 1', `-t ${durationPerImage}`]);
      }

      // Build the filter graph
      const filters: string[] = [];

      // Scale each input
      for (let i = 0; i < n; i++) {
        filters.push(
          `[${i}:v]scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height},setpts=PTS-STARTPTS,fps=${specs.fps},format=yuv420p[v${i}]`
        );
      }

      // Chain xfade transitions
      if (n === 2) {
        const offset = durationPerImage - transitionDuration;
        filters.push(
          `[v0][v1]xfade=transition=${pick(0)}:duration=${transitionDuration}:offset=${offset}[outv]`
        );
      } else {
        // First transition
        const offset0 = durationPerImage - transitionDuration;
        filters.push(
          `[v0][v1]xfade=transition=${pick(0)}:duration=${transitionDuration}:offset=${offset0}[xf0]`
        );

        // Middle transitions
        for (let i = 2; i < n; i++) {
          const prevLabel = i === 2 ? 'xf0' : `xf${i - 2}`;
          const accumulatedDuration = durationPerImage + (i - 1) * (durationPerImage - transitionDuration) - transitionDuration;
          const outLabel = i === n - 1 ? 'outv' : `xf${i - 1}`;
          filters.push(
            `[${prevLabel}][v${i}]xfade=transition=${pick(i - 1)}:duration=${transitionDuration}:offset=${accumulatedDuration}[${outLabel}]`
          );
        }
      }

      const totalDuration = n * durationPerImage - (n - 1) * transitionDuration;

      cmd
        .outputOptions([
          '-filter_complex', filters.join(';'),
          '-map', '[outv]',
          '-t', String(totalDuration),
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-pix_fmt', 'yuv420p',
          `-r`, String(specs.fps),
        ])
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
   * Process video with voiceover only (no background music).
   */
  static async processVideoWithVoiceover(
    inputPath: string,
    ttsPath: string,
    outputPath: string,
    platform: 'tiktok' | 'instagram' | 'facebook' | 'youtube',
    options?: { caption?: string; hashtags?: string[] }
  ): Promise<string> {
    const specs = PLATFORM_SPECS[platform];
    const outroSeconds = 5;

    const metadata = await this.getVideoInfo(inputPath);
    const videoDuration = metadata?.format?.duration ?? 30;
    const cappedVideoDuration = Math.min(videoDuration, specs.maxDuration);
    const totalDuration = cappedVideoDuration + outroSeconds;

    const caption = options?.caption ?? '';
    const hashtags = options?.hashtags ?? [];
    const captionLine = (caption || 'Thanks for watching').slice(0, 80);
    const hashtagLine = hashtags.slice(0, 5).join(' ');
    const outroLine2 = hashtagLine ? hashtagLine.slice(0, 60) : '';
    const rawText = outroLine2 ? `${captionLine}\\n${outroLine2}` : captionLine;
    const escapedText = rawText
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'");

    const fontsize = platform === 'tiktok' ? 52 : 44;
    const drawtext = `drawtext=text='${escapedText}':fontcolor=white:fontsize=${fontsize}:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.6:boxborderw=12`;

    const filterComplex = [
      `[0:v]scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height},trim=duration=${cappedVideoDuration},setpts=PTS-STARTPTS,fps=${specs.fps}[vscaled]`,
      `color=c=black:s=${specs.width}x${specs.height}:d=${outroSeconds}:r=${specs.fps}[outro]`,
      `[outro]${drawtext}[outro_text]`,
      `[vscaled][outro_text]concat=n=2:v=1:a=0[outv]`,
      `[1:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS,volume=1.3[a]`,
    ];

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(inputPath)
        .input(ttsPath)
        .outputOptions([
          '-filter_complex', filterComplex.join(';'),
          '-map', '[outv]',
          '-map', '[a]',
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
      // With TTS: split TTS into two copies so it can be used for ducking AND mixing
      filterComplex = [
        `[0:v]scale=${specs.width}:${specs.height}:force_original_aspect_ratio=increase,crop=${specs.width}:${specs.height},trim=duration=${cappedVideoDuration},setpts=PTS-STARTPTS,fps=${specs.fps}[vscaled]`,
        `color=c=black:s=${specs.width}x${specs.height}:d=${outroSeconds}:r=${specs.fps}[outro]`,
        `[outro]${drawtext}[outro_text]`,
        `[vscaled][outro_text]concat=n=2:v=1:a=0[outv]`,
        `[2:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS,volume=1.3,asplit=2[tts_duck][tts_mix]`,
        `[1:a]atrim=0:${totalDuration},asetpts=PTS-STARTPTS[music]`,
        `[music][tts_duck]sidechaincompress=threshold=0.03:ratio=4:attack=200:release=1000[music_ducked]`,
        `[music_ducked][tts_mix]amix=inputs=2:duration=longest:weights=0.4 1.5[a]`,
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
   * Get duration of an audio file in seconds
   */
  static async getAudioDuration(filePath: string): Promise<number> {
    const metadata = await this.getVideoInfo(filePath);
    return metadata?.format?.duration ?? 0;
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
