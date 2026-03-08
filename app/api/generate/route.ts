import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { GeneratedContent } from "@/types";
import { TrendResearcher } from "@/lib/trendResearcher";

// Increase timeout for this route (OpenAI can take 15-20s)
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeMediaWithAI(
  files: File[]
): Promise<GeneratedContent> {
  const fileDescriptions = files.map((f, i) => 
    `File ${i + 1}: ${f.name} (${f.type})`
  ).join(", ");

  // Get real trending data
  const trendData = await TrendResearcher.getTrendingData('log cabin building');
  const successPatterns = await TrendResearcher.analyzeSuccessfulContent();

  const prompt = `You are a social media expert for Creative Living Cabins, the UK's premier bespoke log cabin company.

COMPANY DEEP DIVE (from creativelivingcabins.co.uk):
- **Display villages**: Bagshot, Ripley, Surbiton (Surrey) – visit to see furnished cabins in person
- **Cabin models** (for reference only – NEVER use these names in captions): Berkshire, Cumbria, Cambridgeshire, Cornwall, Devon, Dorset, Essex, Hampshire, Kent, London, Norfolk, Somerset, Suffolk, Surrey, Sussex, Wiltshire
- **Bespoke**: FREE design service – draughtsmen help you create your own layout at no extra cost
- **Materials**: Siberian spruce, interlocking plank system, double tongue-and-grooved wind lock, sustainable forests
- **Basework**: Recycled plastic posts (won't rot like timber) – 5-year guarantee on cabin, basework, materials & workmanship
- **Doors & windows**: Toughened glass, insulated panels, 4-point locking, tilt-and-turn – all standard
- **Uses**: Home offices, garden rooms, studios, family rooms, pool houses, gyms, art studios
- **Current offer**: SAVE UP TO £2,245 – FREE Cabin Construction or Heating & Air Con (ends 31st March 2026)
- **No hard sell**: Free site surveys, no pushy salesmen, customer interests first
- **Customer quotes**: "Excellent quality and value", "Super professional", "What you get for your money is superb"

BRAND REQUIREMENTS:
✅ MUST mention "Creative Living Cabins" in EVERY caption
✅ MUST include #CreativeLivingCabins in EVERY hashtag list
✅ Use @CreativeLivingCabins for platform mentions
✅ Display villages: Bagshot, Ripley, Surbiton (do NOT change these locations)
✅ FORBIDDEN in captions: Berkshire, Cumbria, Cambridgeshire, Cornwall, Devon, Dorset, Essex, Hampshire, Kent, London, Norfolk, Somerset, Suffolk, Surrey, Sussex, Wiltshire – user adds these via checkbox if needed

Files uploaded: ${fileDescriptions}

REAL TRENDING DATA (March 2026):
- TikTok trending hashtags: ${trendData.tiktok.trendingHashtags.slice(0, 10).join(', ')}
- TikTok viral hooks: ${trendData.tiktok.viralHooks.slice(0, 3).join(' | ')}
- TikTok optimal length: ${trendData.tiktok.optimalLength} seconds
- Instagram trending: ${trendData.instagram.trendingHashtags.slice(0, 10).join(', ')}
- Instagram optimal length: ${trendData.instagram.optimalLength} seconds
- YouTube trending topics: log cabin builds, garden offices, bespoke construction
- Facebook optimal length: ${trendData.facebook.optimalLength} seconds

WHAT'S WORKING NOW:
${successPatterns.commonElements.join(', ')}

CAPTION STYLE – MODERN & ENGAGING (NOT plain or outdated):
- **Scroll-stopping hooks**: "POV:", "Wait for it...", "This is why...", "The moment...", "No extension needed."
- **Specific over generic**: Uses (home office, pool house), locations (Bagshot, Ripley, Surbiton) – do NOT name cabin models
- **Numbers & proof**: "5-year guarantee", "FREE design service", "Save up to £2,245"
- **Emotional triggers**: "Dream cabin", "Game-changer", "Finally", "Worth the wait"
- **Questions**: "Need a garden office?", "Thinking extension? Think again."
- **Behind-the-scenes**: Construction moments, craftsmanship close-ups, before/after
- **Avoid**: Corporate jargon, vague claims, boring intros

For each platform provide:
1. **Caption**: Punchy hook + Creative Living Cabins + specific detail (location, offer, or use case – no cabin model names)
2. **CaptionVariants**: 2-3 alternatives with different hooks – mix question, POV, and benefit-led
3. **Hashtags**: #CreativeLivingCabins FIRST + #LogCabins #GardenOffice #BespokeCabins #Surrey #UK + trending
4. **Music Suggestions**: Upbeat, inspiring, or satisfying-build vibes
5. **Video Edit Tips**: Specific to content – e.g. "Before/after reveal", "Plastic post base close-up", "Show construction progress" (no cabin model names)

Return as JSON matching this structure:
{
  "tiktok": {
    "caption": "Punchy hook + Creative Living Cabins + specific detail",
    "captionVariants": ["Option 1...", "Option 2...", "Option 3..."],
    "hashtags": ["#CreativeLivingCabins", "#LogCabins", "#GardenOffice", "...trending..."],
    "musicSuggestions": ["..."],
    "format": "Vertical 9:16, ${trendData.tiktok.optimalLength}s",
    "videoEdits": ["Specific tip 1", "Specific tip 2"]
  },
  "instagram": { "caption": "...", "captionVariants": [...], "hashtags": [...], "musicSuggestions": [...], "format": "...", "videoEdits": [...] },
  "facebook": { "caption": "...", "captionVariants": [...], "hashtags": [...], "musicSuggestions": [...], "format": "...", "videoEdits": [...] },
  "youtube": { "caption": "...", "captionVariants": [...], "hashtags": [...], "musicSuggestions": [...], "format": "...", "videoEdits": [...] },
  "analysis": {
    "scene": "Description of uploaded content",
    "materials": ["..."],
    "stage": "Construction/installation phase",
    "keyMoments": ["..."],
    "recommendedDuration": "..."
  }
}

CRITICAL:
✅ "Creative Living Cabins" in every caption
✅ #CreativeLivingCabins first hashtag
✅ Display villages: Bagshot, Ripley, Surbiton only
✅ Modern, scroll-stopping captions – NOT plain or corporate
✅ Reference locations, offers, uses – NOT cabin model names`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are the social media expert for Creative Living Cabins (creativelivingcabins.co.uk). You create scroll-stopping, modern captions. NEVER use cabin model names (Berkshire, Cumbria, Cambridgeshire, Cornwall, Devon, Dorset, Essex, Hampshire, Kent, London, Norfolk, Somerset, Suffolk, Surrey, Sussex, Wiltshire) in captions—the user adds those via a separate checkbox. Use: punchy hooks, locations (Bagshot/Ripley/Surbiton), uses (home office, pool house), offers (save £2,245, 5-year guarantee). Always include Creative Living Cabins and #CreativeLivingCabins. Respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.9,
    max_tokens: 2500, // Optimize response time
    response_format: { type: "json_object" },
  });

  const result = completion.choices[0].message.content;
  if (!result) {
    throw new Error("No content generated");
  }

  const generated = JSON.parse(result) as GeneratedContent;

  // Add best posting times from trend data
  generated.tiktok.bestPostingTimes = trendData.tiktok.bestPostingTimes;
  generated.instagram.bestPostingTimes = trendData.instagram.bestPostingTimes;
  generated.facebook.bestPostingTimes = trendData.facebook.bestPostingTimes;
  generated.youtube.bestPostingTimes = trendData.youtube.bestPostingTimes;

  // Ensure captionVariants exists (fallback to single caption if AI omits it)
  for (const platform of ["tiktok", "instagram", "facebook", "youtube"] as const) {
    const p = generated[platform];
    if (!p.captionVariants?.length && p.caption) {
      p.captionVariants = [p.caption];
    }
  }

  return generated;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const generatedContent = await analyzeMediaWithAI(files);

    return NextResponse.json(generatedContent);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
