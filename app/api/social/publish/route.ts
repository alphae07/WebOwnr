// /app/api/social/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import {
  getSocialPlatforms,
  getProduct,
  createSocialPost,
  updatePostMetrics,
} from "@/lib/firebase";
import { FacebookAPI, TwitterAPI, TikTokAPI } from "@/lib/social-media-api";
import { toast } from "sonner";

export async function POST(req: NextRequest) {
  try {
    const { userId, postData } = await req.json();
    const { productIds, platforms, caption } = postData;

    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user's connected platforms (they provided their own OAuth tokens)
    const userPlatforms = await getSocialPlatforms(userId);
    const platformMap = new Map(userPlatforms.map(p => [p.id, p]));

    const publishResults: Record<string, any> = {};

    // Get product data for image URLs
    const productImages: string[] = [];
    for (const productId of productIds) {
      const product = await getProduct(userId, productId);
      if (product) {
        productImages.push(product.image);
      }
    }

    const imageUrl = productImages[0] || "";

    // Publish to each selected platform
    for (const platformId of platforms) {
      try {
        const platform = platformMap.get(platformId);
        if (!platform || !platform.connected || !platform.accessToken) {
          publishResults[platformId] = {
            success: false,
            error: "Platform not connected",
          };
          continue;
        }

        let result;
        const finalCaption = `${caption}\n\nShop now: ${process.env.NEXT_PUBLIC_APP_URL}/products/${productIds[0]}`;

        switch (platformId) {
          case "facebook":
          case "instagram":
            const fbApi = new FacebookAPI(platform.accessToken, platform.profileId!);
            result = await fbApi.publishPost(finalCaption, imageUrl);
            break;

          case "twitter":
            const twitterApi = new TwitterAPI(platform.accessToken);
            result = await twitterApi.publishPost(finalCaption);
            break;

          case "tiktok":
            const tiktokApi = new TikTokAPI(platform.accessToken, platform.profileId!);
            result = await tiktokApi.publishPost(finalCaption, imageUrl);
            break;

          default:
            throw new Error("Unsupported platform");
        }

        publishResults[platformId] = {
          success: true,
          postId: result.postId,
          url: result.url,
        };
      } catch (error) {
        publishResults[platformId] = {
          success: false,
          error: error instanceof Error ? error.message : "Publication failed",
        };
      }
    }

    // Create post record in Firestore
    const postId = await createSocialPost(userId, {
      productIds,
      platforms,
      caption,
      status: "published",
      metrics: { views: 0, clicks: 0, conversions: 0 },
      publishedAt: new Date(),
      platformPosts: publishResults,
    });

    return NextResponse.json({
      success: true,
      postId,
      results: publishResults,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Publication failed" },
      { status: 500 }
    );
  }
}

