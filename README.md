# Power Social 🪓

**AI-Powered Social Media Content Generator for Log Cabin Construction**

Transform your construction clips and photos into viral social media content optimized for TikTok, Instagram, Facebook, and YouTube.

## Features

✨ **Drag & Drop Upload** - Simple interface for videos and images
🤖 **AI Content Analysis** - Automatically detects scenes, materials, and key moments
✂️ **Smart Video Editing** - Converts long videos into platform-optimized shorts
📝 **Trending Captions** - AI generates current, engaging captions
#️⃣ **Platform-Specific Hashtags** - Trending and niche tags for each platform
🎵 **Music Suggestions** - Recommendations for trending background music
📱 **Multi-Platform Support** - TikTok (9:16), Instagram Reels, Facebook, YouTube Shorts

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4
- **Upload**: React Dropzone

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

## How to Use

1. **Upload Content**: Drag and drop videos or images of your log cabin construction
2. **Generate**: Click "Generate Social Media Content"
3. **AI Analysis**: The app analyzes your content and creates platform-specific posts
4. **Copy & Share**: Copy captions and hashtags for each platform

## Platform Specifications

### TikTok
- **Format**: Vertical 9:16
- **Duration**: 15-60 seconds
- **Focus**: Trending sounds, viral hooks

### Instagram Reels
- **Format**: Vertical 9:16
- **Duration**: 15-90 seconds
- **Focus**: Aesthetic, story-driven

### Facebook
- **Format**: Square or 16:9
- **Duration**: Flexible
- **Focus**: Community engagement, storytelling

### YouTube Shorts
- **Format**: Vertical 9:16
- **Duration**: Under 60 seconds
- **Focus**: Educational, tutorial-style

## API Key Setup

Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Future Enhancements

- [ ] Automated video editing with FFmpeg
- [ ] Cloud storage integration (Cloudinary)
- [ ] Direct posting to social platforms
- [ ] Analytics and performance tracking
- [ ] Save/load projects
- [ ] Custom music library
- [ ] Batch processing
- [ ] A/B testing captions

## License

MIT

---

Built for craftsmen who build amazing log cabins and want to share their work with the world 🪵
