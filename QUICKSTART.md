# 🚀 Quick Start Guide - Power Social

## Your App is Running!

✅ Development server is live at: **http://localhost:3000**

---

## 📋 Next Steps

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)

### 2. Add Your API Key

Open the `.env` file in your project and add your key:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Save the file and restart the dev server:
```bash
npm run dev
```

---

## 🎯 How to Use Power Social

### Step 1: Upload Content
- Open http://localhost:3000 in your browser
- Drag and drop videos or images from your phone/computer
- Or click to browse and select files
- Supports: MP4, MOV, JPG, PNG

### Step 2: Generate Content
- Click the **"Generate Social Media Content"** button
- AI will analyze your log cabin construction content
- Takes 10-30 seconds depending on file size

### Step 3: Get Your Content
You'll receive optimized content for:
- 🎵 **TikTok**: Vertical videos, trending sounds, viral hooks
- 📸 **Instagram**: Reels format, aesthetic captions
- 👥 **Facebook**: Community-focused, storytelling
- ▶️ **YouTube Shorts**: Tutorial-style, educational

For each platform you get:
- ✍️ Engaging captions with hooks
- #️⃣ Trending hashtags (10-15 tags)
- 🎵 Background music suggestions
- ✂️ Video editing tips (timing, cuts, text overlays)

### Step 4: Copy & Post
- Click "Copy Caption & Hashtags" for any platform
- Paste directly into your social media post
- Follow the video edit tips
- Add suggested music
- Post and watch the engagement roll in!

---

## 📱 Mobile Upload

### Option 1: Use from Phone Browser
1. Open http://localhost:3000 on your phone (if on same WiFi)
2. Upload directly from your phone camera roll

### Option 2: AirDrop/Transfer
1. Transfer clips from phone to computer
2. Drag and drop into Power Social

---

## 💡 Pro Tips

### Getting Best Results:
1. **Upload clear, well-lit footage** of your log cabin work
2. **Show progress** - before/after, process shots work great
3. **Highlight craftsmanship** - close-ups of techniques
4. **Capture satisfying moments** - logs fitting perfectly, sawing, assembly

### Video Length:
- For **1-minute+ videos**: AI suggests how to cut into shorts
- For **short clips**: AI optimizes for each platform
- Mix photos and videos for best results

### Captions:
- AI generates **trending** language (2026 trends)
- Hooks designed to stop scrolling
- Platform-optimized (casual for TikTok, polished for YouTube)

---

## 🛠️ Troubleshooting

### "Failed to generate content"
- Check your `.env` file has the correct OpenAI API key
- Make sure key starts with `sk-`
- Restart dev server: Stop (Ctrl+C) and run `npm run dev`

### Files won't upload
- Check file format (MP4, MOV, JPG, PNG only)
- File size limit: 50MB per file
- Try smaller/compressed files

### Server won't start
- Make sure port 3000 is available
- Run `npm install` to ensure all dependencies installed
- Check for error messages in terminal

---

## 🎨 Customization

Want to customize the app? Edit these files:
- `app/page.tsx` - Main page layout
- `components/MediaUploader.tsx` - Upload interface
- `app/api/generate/route.ts` - AI prompts and logic
- `app/globals.css` - Styling and colors

---

## 📊 What Gets Generated

### TikTok Content:
- Vertical 9:16 format
- 15-60 second clips
- Gen Z language, trending hooks
- Popular construction sounds/music

### Instagram Reels:
- Vertical 9:16 format
- Aesthetic captions
- Mix of trending + niche hashtags
- Story-driven content

### Facebook Posts:
- Longer storytelling
- Community engagement focus
- Behind-the-scenes context
- Educational value

### YouTube Shorts:
- Vertical under 60s
- Tutorial/educational style
- Clear, clickable hooks
- How-to format

---

## 💰 Cost Estimate

**OpenAI API Pricing** (approximate):
- GPT-4: ~$0.03 per generation
- Analyzing 1 video + generating all 4 platforms: ~$0.05-0.10
- Very affordable for regular use!

---

## 🚀 Future Features Coming

- [ ] Direct video editing (auto-cut shorts)
- [ ] Save/load projects
- [ ] Batch processing multiple videos
- [ ] Performance analytics
- [ ] Custom music library
- [ ] Direct posting to platforms

---

## 📞 Need Help?

If you run into issues:
1. Check this guide first
2. Read the error message carefully
3. Verify API key is correct
4. Make sure dev server is running
5. Check files are correct format

---

## 🎉 You're Ready!

Your app is running at **http://localhost:3000**

Go build some amazing log cabins and share them with the world! 🪵🪓

