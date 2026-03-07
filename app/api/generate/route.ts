import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { GeneratedContent } from "@/types";
import { TrendResearcher } from "@/lib/trendResearcher";

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

  const prompt = `You are a social media expert for Creative Living Cabins, a UK-based premium log cabin company.

COMPANY INFORMATION - CRITICAL:
Company Name: Creative Living Cabins
Location: Surrey, UK (3 display villages)
Website: www.creativelivingcabins.co.uk
Specialization: Bespoke, made-to-measure log cabins, garden offices, home offices
Materials: Sustainable Siberian spruce from harvested forests
USP: Hand-crafted, bespoke designs, superior basework with plastic post system (5-year guarantee)
Features: Premium doors & windows, cavity wall insulation, air conditioning options
Key Differentiators: Free design service, free site surveys, no hard sell approach

BRAND REQUIREMENTS:
✅ MUST mention "Creative Living Cabins" in EVERY caption
✅ MUST include #CreativeLivingCabins in EVERY hashtag list
✅ Use @CreativeLivingCabins for platform mentions
✅ Emphasize UK-based, Surrey locations, premium quality
✅ Highlight bespoke/custom design capabilities
✅ Mention sustainable materials when relevant

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

TONE & MESSAGING:
- Professional but approachable (family-owned feel)
- Emphasize quality and craftsmanship
- UK-focused (Surrey display villages)
- Highlight customer satisfaction (many testimonials)
- Mention: bespoke design, sustainable materials, superior basework
- Target: Homeowners wanting garden offices, studios, living spaces

Analyze this Creative Living Cabins content and create engaging social media posts for each platform:

Requirements:
- **TikTok**: ${trendData.tiktok.optimalLength}s, viral hooks, showcase craftsmanship of Creative Living Cabins
- **Instagram**: ${trendData.instagram.optimalLength}s, tag @CreativeLivingCabins, beautiful aesthetics, Surrey UK
- **Facebook**: ${trendData.facebook.optimalLength}s, mention 3 Surrey display villages, free site surveys
- **YouTube Shorts**: ${trendData.youtube.optimalLength}s, educational, credit Creative Living Cabins

For each platform provide:
1. **Caption**: Viral hook + "Creative Living Cabins" mention + quality/bespoke focus + Surrey/UK context
2. **Hashtags**: #CreativeLivingCabins FIRST + trending hashtags + #Surrey #UK #BespokeCabins
3. **Music Suggestions**: Trending tracks
4. **Video Edit Tips**: Showcase quality, craftsmanship, before/after transformations

Focus on Creative Living Cabins':
- Bespoke, hand-crafted quality
- Sustainable Siberian spruce
- Superior plastic post basework (5yr guarantee)
- Premium doors & windows
- Surrey display villages
- Garden offices & home offices
- Free design service
- Customer satisfaction

Return as JSON matching this structure:
{
  "tiktok": {
    "caption": "Viral hook + Creative Living Cabins + quality focus + UK context",
    "hashtags": ["#CreativeLivingCabins", "#UK", "#Surrey", "...trending tags..."],
    "musicSuggestions": ["..."],
    "format": "Vertical 9:16, ${trendData.tiktok.optimalLength}s",
    "videoEdits": ["Showcase quality", "Before/after", "Bespoke details"]
  },
  "instagram": { 
    "caption": "@CreativeLivingCabins + craftsmanship story + Surrey location",
    "hashtags": ["#CreativeLivingCabins", "#Surrey", "#UK", "...trending..."],
    "musicSuggestions": ["..."],
    "format": "...",
    "videoEdits": ["..."]
  },
  "facebook": { 
    "caption": "Creative Living Cabins + community focus + 3 display villages mention",
    "hashtags": ["#CreativeLivingCabins", "#Surrey", "..."],
    "musicSuggestions": ["..."],
    "format": "...",
    "videoEdits": ["..."]
  },
  "youtube": { 
    "caption": "How Creative Living Cabins builds bespoke log cabins | Surrey UK",
    "hashtags": ["#CreativeLivingCabins", "#Surrey", "#UK", "..."],
    "musicSuggestions": ["..."],
    "format": "...",
    "videoEdits": ["..."]
  },
  "analysis": {
    "scene": "Creative Living Cabins construction/installation",
    "materials": ["Siberian spruce", "tools", "basework"],
    "stage": "Construction phase",
    "keyMoments": ["..."],
    "recommendedDuration": "..."
  }
}

CRITICAL REQUIREMENTS:
✅ "Creative Living Cabins" in every caption
✅ #CreativeLivingCabins first or second hashtag
✅ Mention UK/Surrey when natural
✅ Emphasize bespoke/quality/craftsmanship
✅ Professional, trustworthy tone
✅ Include call-to-action (visit display villages, free site survey)`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are the social media expert for Creative Living Cabins, a premium UK log cabin company based in Surrey. You create professional, engaging content that showcases their bespoke craftsmanship, sustainable materials, and superior quality. You always include Creative Living Cabins branding and #CreativeLivingCabins. Respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.9,
    response_format: { type: "json_object" },
  });

  const result = completion.choices[0].message.content;
  if (!result) {
    throw new Error("No content generated");
  }

  return JSON.parse(result) as GeneratedContent;
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
