// app/api/ai/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

interface GenerateRequest {
  userId: string;
  tool: string;
  input: string;
  creditsNeeded: number;
}

const TOOL_PROMPTS: Record<string, string> = {
  description: `You are an expert e-commerce copywriter. Generate a compelling and persuasive product description based on the following information. Include features, benefits, and a call to action. Format it nicely with emojis and sections. Keep it under 200 words but impactful.

Input: {input}

Generate a product description:`,

  seo: `You are an SEO expert. Generate optimized SEO content including:
1. A compelling title tag (under 60 characters)
2. A meta description (under 155 characters)
3. Relevant keywords

Make the content specific and optimized for search engines.

Input: {input}

Generate SEO optimized content:`,

  social: `You are a social media expert. Generate engaging social media captions for different platforms based on the following information. Include platform-specific hashtags and emojis. Create versions for Instagram, Twitter/X, and LinkedIn.

Input: {input}

Generate social media captions:`,

  brand: `You are a brand strategist. Develop comprehensive brand voice guidelines based on the provided description. Include:
1. Tone and personality
2. Voice characteristics
3. Sample taglines
4. Do's and Don'ts

Make it practical and actionable.

Input: {input}

Generate brand voice guidelines:`,
};

// Reset credits monthly
async function checkAndResetCredits(userId: string) {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) return;

  const data = userDoc.data();
  const credits = data.credits || {};
  const nextReset = new Date(credits.nextReset || Date.now());

  if (new Date() > nextReset) {
    // Reset credits
    const plan = data.plan || "free";
    const creditLimit = plan === "premium" ? 100 : 20;

    await updateDoc(doc(db, "users", userId), {
      credits: {
        available: creditLimit,
        used: 0,
        limit: creditLimit,
        nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    return {
      available: creditLimit,
      used: 0,
      limit: creditLimit,
    };
  }

  return credits;
}

async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) {
      throw new Error("No response from Gemini API");
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const { userId, tool, input, creditsNeeded } = body;

    if (!userId || !tool || !input || !creditsNeeded) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate tool
    if (!TOOL_PROMPTS[tool]) {
      return NextResponse.json(
        { message: "Invalid tool selected" },
        { status: 400 }
      );
    }

    // Get user data and check credits
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check and reset credits if needed
    const credits = await checkAndResetCredits(userId);

    if (!credits || credits.available < creditsNeeded) {
      return NextResponse.json(
        {
          message: `Insufficient credits. Required: ${creditsNeeded}, Available: ${credits?.available || 0}`,
        },
        { status: 402 }
      );
    }

    // Generate content with Gemini
    const prompt = TOOL_PROMPTS[tool].replace("{input}", input);
    const output = await generateWithGemini(prompt);

    // Update user credits
    const newAvailable = credits.available - creditsNeeded;
    const newUsed = (credits.used || 0) + creditsNeeded;

    await updateDoc(doc(db, "users", userId), {
      credits: {
        ...credits,
        available: newAvailable,
        used: newUsed,
      },
    });

    // Save to generation history
    const generationRef = await addDoc(collection(db, "ai-generations"), {
      userId,
      tool,
      input,
      output,
      creditsUsed: creditsNeeded,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      output,
      generationId: generationRef.id,
      creditsRemaining: newAvailable,
    });
  } catch (error) {
    console.error("Generation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Insufficient credits")) {
        return NextResponse.json(
          { message: error.message },
          { status: 402 }
        );
      }
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}