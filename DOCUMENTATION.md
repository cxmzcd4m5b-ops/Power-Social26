# 🎯 Power Social - Complete Project Documentation

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [What This App Does](#what-this-app-does)
3. [Setup Guide](#setup-guide)
4. [How to Use](#how-to-use)
5. [Features](#features)
6. [Technical Details](#technical-details)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [FAQ](#faq)

---

## 🚀 Quick Start

### Status: ✅ App is Running!

**Your app is live at**: http://localhost:3000

### To Start Using Right Now:

1. **Add OpenAI API Key** to `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Refresh browser** at http://localhost:3000

3. **Upload** your log cabin videos/photos

4. **Click** "Generate Social Media Content"

5. **Done!** Copy captions and post to social media

**That's it!** 🎉

---

## 🎬 What This App Does

Power Social transforms your log cabin construction content into viral social media posts.

### Input:
- Videos (MP4, MOV, AVI, MKV)
- Photos (JPG, PNG, GIF)
- From your phone or camera

### AI Magic:
- Analyzes your content
- Detects construction techniques
- Identifies key moments
- Understands context

### Output:
**4 Platform-Optimized Posts:**

1. **TikTok** 🎵
   - Viral hooks
   - Trending hashtags
   - Music suggestions
   - Edit timing tips

2. **Instagram** 📸
   - Aesthetic captions
   - Story-driven content
   - Reels optimization
   - Visual guidance

3. **Facebook** 👥
   - Community focus
   - Storytelling format
   - Engagement hooks
   - Longer context

4. **YouTube Shorts** ▶️
   - SEO-optimized titles
   - Tutorial format
   - Educational angle
   - Searchable content

---

## 🔧 Setup Guide

### Prerequisites:
- ✅ Node.js installed (already done)
- ✅ npm installed (already done)
- ✅ Dependencies installed (already done)
- ⏳ **OpenAI API key** (you need to add this)

### Getting OpenAI API Key:

#### Step 1: Create Account
1. Go to https://platform.openai.com
2. Sign up (or log in)
3. Verify email

#### Step 2: Get API Key
1. Click "API Keys" in sidebar
2. Click "Create new secret key"
3. Name it (e.g., "Power Social")
4. **Copy the key** (starts with `sk-`)
5. ⚠️ Save it somewhere safe (shown only once!)

#### Step 3: Add to Project
1. Open `.env` file in project root
2. Replace `OPENAI_API_KEY=` with your key:
   ```env
   OPENAI_API_KEY=sk-proj-abcdefg...your-actual-key
   ```
3. **Save the file**
4. Refresh browser

### Verifying Setup:

✅ **Working**: Green banner says "Ready to go!"
❌ **Not Working**: Orange banner says "Setup Required"

---

## 📱 How to Use

### Complete Process:

#### 1. Capture Content (On-Site)
- Film your log cabin construction
- Take photos of progress
- Record techniques and moments
- **Tip**: Film vertical (9:16) for social media

#### 2. Transfer to Computer
- USB cable
- Cloud storage (Google Photos, iCloud)
- AirDrop (Mac)

#### 3. Open Power Social
- Browser: http://localhost:3000
- Should see upload interface

#### 4. Upload Files
**Method A**: Drag and drop
- Drag files from folder
- Drop onto upload area

**Method B**: Click to browse
- Click upload area
- Select files
- Click "Open"

**Supported formats**:
- Videos: MP4, MOV, AVI, MKV
- Images: JPG, PNG, GIF
- Max size: 50MB per file

#### 5. Generate Content
- Click **"Generate Social Media Content"**
- Wait 20-45 seconds
- AI analyzes and creates content

#### 6. Review Results
You'll see 4 cards (one per platform):
- TikTok
- Instagram
- Facebook
- YouTube Shorts

Each contains:
- 📝 Caption
- #️⃣ Hashtags
- 🎵 Music suggestions
- ✂️ Video edit tips

#### 7. Copy & Use
- Click **"Copy Caption & Hashtags"** on any platform
- Content copied to clipboard
- Paste into social media app
- Follow edit tips
- Add suggested music
- Post!

---

## ✨ Features

### Upload System
- ✅ Drag-and-drop interface
- ✅ Multi-file upload
- ✅ File preview
- ✅ Remove files option
- ✅ Progress indicators
- ✅ Error handling

### AI Analysis
- ✅ Scene detection
- ✅ Material identification
- ✅ Technique recognition
- ✅ Key moment detection
- ✅ Construction phase awareness
- ✅ Context understanding

### Content Generation
- ✅ Platform-specific captions
- ✅ Trending hashtags (10-15 per platform)
- ✅ Music suggestions (3+ per platform)
- ✅ Video editing tips
- ✅ Format specifications
- ✅ Optimization guidance

### User Interface
- ✅ Clean, modern design
- ✅ Mobile-responsive
- ✅ One-click copy
- ✅ Setup helper banner
- ✅ Loading states
- ✅ Error messages

### Platform Support

#### TikTok
- Format: Vertical 9:16
- Duration: 15-60s
- Style: Viral, trending
- Music: Current hits
- Hashtags: Mix mega + niche

#### Instagram Reels
- Format: Vertical 9:16
- Duration: 15-90s
- Style: Aesthetic, story-driven
- Music: Reels-friendly
- Hashtags: Strategic mix

#### Facebook
- Format: Square/16:9
- Duration: 1-3 minutes
- Style: Community-focused
- Music: Background ambiance
- Hashtags: Community tags

#### YouTube Shorts
- Format: Vertical 9:16
- Duration: <60s
- Style: Educational
- Music: Copyright-safe
- Hashtags: SEO-optimized

---

## 🛠️ Technical Details

### Tech Stack
```
Frontend:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)

Backend:
- Next.js API Routes
- OpenAI GPT-4 API
- FormData handling

Upload:
- React Dropzone
- Client-side preview
- Multi-file support

Validation:
- Zod schemas
- TypeScript types
- Runtime checks
```

### Project Structure
```
Power Social/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── generate/         # Content generation
│   │   └── health/           # Setup check
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── MediaUploader.tsx     # File upload UI
│   ├── ContentGenerator.tsx  # Generation logic
│   ├── PlatformCards.tsx     # Results display
│   └── SetupBanner.tsx       # Setup helper
├── types/                    # TypeScript types
│   └── index.ts              # Type definitions
├── .env                      # Environment variables
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── next.config.js            # Next.js config
```

### API Endpoints

#### POST /api/generate
**Purpose**: Generate social media content

**Input**: FormData with files
```typescript
FormData {
  files: File[]
}
```

**Output**: JSON with generated content
```typescript
{
  tiktok: PlatformContent,
  instagram: PlatformContent,
  facebook: PlatformContent,
  youtube: PlatformContent,
  analysis: {
    scene: string,
    materials: string[],
    stage: string,
    keyMoments: string[]
  }
}
```

#### GET /api/health
**Purpose**: Check if OpenAI API key is configured

**Output**:
```typescript
{
  configured: boolean,
  status: "ok"
}
```

### Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...      # OpenAI API key

# Optional (for future features)
CLOUDINARY_CLOUD_NAME=     # Cloud storage
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Dependencies

**Production**:
- next: ^14.2.0
- react: ^18.3.0
- react-dom: ^18.3.0
- react-dropzone: ^14.2.3
- openai: ^4.28.0
- axios: ^1.6.7
- framer-motion: ^11.0.5
- lucide-react: ^0.344.0
- zod: ^3.22.4

**Development**:
- typescript: ^5.3.3
- @types/node: ^20.11.0
- @types/react: ^18.2.48
- @types/react-dom: ^18.2.18
- tailwindcss: ^3.4.1
- autoprefixer: ^10.4.17
- postcss: ^8.4.33
- eslint: ^8.56.0
- eslint-config-next: ^14.2.0

---

## 🔍 Troubleshooting

### Common Issues

#### Issue: "Failed to generate content"

**Cause**: OpenAI API key not configured or invalid

**Solutions**:
1. Check `.env` file exists in project root
2. Verify API key starts with `sk-`
3. Ensure no extra spaces in `.env` file
4. Refresh browser after adding key
5. Check OpenAI account has credits

#### Issue: Files won't upload

**Cause**: File format or size issue

**Solutions**:
1. Check file format (MP4, MOV, JPG, PNG only)
2. Verify file size < 50MB
3. Compress large videos
4. Try uploading fewer files at once
5. Refresh page and try again

#### Issue: Server won't start

**Cause**: Port conflict or missing dependencies

**Solutions**:
1. Check port 3000 is available
2. Run `npm install` again
3. Close other apps using port 3000
4. Try `npm run dev` again
5. Check terminal for error messages

#### Issue: Blank page / errors

**Cause**: JavaScript errors or build issues

**Solutions**:
1. Check browser console (F12)
2. Refresh page (Ctrl+R / Cmd+R)
3. Clear browser cache
4. Run `npm run build` to check for errors
5. Restart dev server

#### Issue: Slow generation

**Cause**: Large files or OpenAI API latency

**Solutions**:
1. Upload smaller/compressed files
2. Upload fewer files at once
3. Check internet connection
4. Be patient (can take 30-45 seconds)
5. Try again if it times out

#### Issue: Bad/irrelevant content

**Cause**: AI misunderstood context

**Solutions**:
1. Upload clearer footage
2. Try multiple clips for better context
3. Upload photos + videos together
4. Regenerate with different files
5. Manually adjust generated content

---

## 📈 Best Practices

### Content Creation

#### Filming Tips:
✅ **Always film vertical** (9:16 aspect ratio)
✅ **Good lighting** (golden hour is best)
✅ **Steady shots** (use tripod if possible)
✅ **Clean lens** before filming
✅ **10-20 second clips** for social media
✅ **Multiple angles** of same action

#### What to Capture:
- Wide shots (overall progress)
- Close-ups (techniques, details)
- Before/after comparisons
- Satisfying moments (perfect fits)
- Action shots (sawing, fitting, building)
- You in the frame (authenticity)

### Upload Strategy

#### Single Upload:
- Best for: Daily quick posts
- Upload: 1-2 videos
- Time: 5-10 minutes

#### Batch Upload:
- Best for: Weekly planning
- Upload: 5-10 videos at once
- Time: 30-60 minutes
- Schedule posts throughout week

### Using Generated Content

#### Captions:
- ✅ Use as-is or customize
- ✅ Add personality
- ✅ Adjust tone if needed
- ✅ Keep hooks intact
- ❌ Don't remove call-to-action

#### Hashtags:
- ✅ Use ALL suggested hashtags
- ✅ Mix of trending + niche is key
- ✅ Can add 1-2 personal tags
- ❌ Don't exceed platform limits

#### Music:
- ✅ Search suggested tracks on platform
- ✅ Use trending sounds when possible
- ✅ Match music to video mood
- ❌ Don't use copyrighted music

#### Video Editing:
- ✅ Follow all AI edit tips
- ✅ Hook in first 3 seconds is CRITICAL
- ✅ Add text overlays
- ✅ Speed up boring parts
- ❌ Don't make videos too long

### Posting Strategy

#### Timing:
- **TikTok**: 7-9 AM, 12-1 PM, 7-9 PM
- **Instagram**: 11 AM, 1-2 PM, 7-9 PM  
- **Facebook**: 1-4 PM
- **YouTube**: Anytime (search-based)

#### Frequency:
- **Ideal**: Daily on all platforms
- **Minimum**: 3-5 times per week
- **Consistency** > Perfection

#### Engagement:
- ✅ Respond to comments within 1 hour
- ✅ Like and reply to everyone
- ✅ Ask questions in captions
- ✅ Use polls and stories
- ✅ Cross-promote platforms

### Growth Strategy

#### First 30 Days:
- Post consistently
- Use all hashtags
- Engage with comments
- Study analytics
- Identify what works

#### After 30 Days:
- Double down on winning content
- Collaborate with others
- Join niche communities
- Start longer-form content
- Consider monetization

---

## ❓ FAQ

### General Questions

**Q: How much does this cost?**
A: Just OpenAI API costs (~$0.08 per generation). Daily use = $2-5/month.

**Q: Do I need coding knowledge?**
A: No! Just upload files and click generate.

**Q: Can I use this on my phone?**
A: Yes! Open http://localhost:3000 on your phone (same WiFi).

**Q: Does this post for me automatically?**
A: Not yet. You copy/paste the content. Auto-posting coming soon!

**Q: Can I customize the generated content?**
A: Yes! Use it as a starting point and adjust as needed.

**Q: What if I don't like the generated content?**
A: Regenerate with different clips or manually edit the output.

### Technical Questions

**Q: Why OpenAI API and not free alternatives?**
A: GPT-4 provides best quality, understands context, and creates trending content.

**Q: Can I run this on a server?**
A: Yes! Run `npm run build` then `npm start` for production.

**Q: How do I deploy this?**
A: Deploy to Vercel, Netlify, or any Node.js hosting.

**Q: Can I add more platforms?**
A: Yes! Modify `types/index.ts` and the AI prompt in `app/api/generate/route.ts`.

**Q: Is my content stored anywhere?**
A: No. Files are sent to OpenAI for analysis then discarded.

**Q: Can I use videos from any source?**
A: Yes, but Power Social is optimized for construction/building content.

### Usage Questions

**Q: What's the best video length to upload?**
A: 30 seconds to 2 minutes works best.

**Q: Should I upload raw or edited videos?**
A: Either! AI can analyze both and provides editing tips.

**Q: How many files can I upload at once?**
A: No hard limit, but 3-5 files work best for context.

**Q: Can I save generated content?**
A: Copy/paste to a document. Save feature coming soon!

**Q: Does it work for photos only?**
A: Yes! Works with just photos, though videos provide more context.

**Q: Can I use this for other niches?**
A: It's optimized for log cabins but works for any construction/woodworking.

### Pricing Questions

**Q: How many posts can I generate per month?**
A: Unlimited! You pay only for OpenAI API usage.

**Q: What if I run out of OpenAI credits?**
A: Add credits to your OpenAI account.

**Q: Is there a free tier?**
A: OpenAI offers $5 free credits for new accounts.

**Q: Can I share this with team members?**
A: Yes! Just share the localhost URL (same network).

---

## 📚 Additional Resources

### Documentation Files:
- **README.md** - Technical documentation
- **QUICKSTART.md** - Fast setup guide
- **BEST_PRACTICES.md** - Social media strategy
- **EXAMPLE_OUTPUT.md** - Sample generated content
- **WORKFLOW_GUIDE.md** - Complete workflow
- **PROJECT_SUMMARY.md** - Project overview
- **THIS FILE** - Complete documentation

### Useful Links:
- [OpenAI Platform](https://platform.openai.com) - Get API key
- [Next.js Docs](https://nextjs.org/docs) - Framework docs
- [Tailwind CSS](https://tailwindcss.com) - Styling docs
- [React Dropzone](https://react-dropzone.js.org) - Upload component

### Commands Reference:
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter

# Utilities
npx tsc --noEmit     # Check TypeScript
```

---

## 🎉 You're Ready to Go!

### Quick Recap:

1. ✅ **App is built and running**
2. ⏳ **Add OpenAI API key to `.env`**
3. ✅ **Upload your content**
4. ✅ **Generate social media posts**
5. ✅ **Copy and post to platforms**
6. ✅ **Watch your content go viral!**

### Need Help?

- Read the guides in project folder
- Check troubleshooting section
- Review example output
- Follow workflow guide

---

## 🚀 Start Creating!

**Your log cabin craftsmanship deserves to be seen by the world.**

**Power Social makes it easy to share your work and grow your audience.**

**Now go build, film, and create amazing content!** 🪵🔥

---

*Built with ❤️ for craftsmen who build amazing things*

**Happy Building! 🪓**
