// /app/api/social/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";
import { saveSocialPlatform } from "@/lib/firestore";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/social?error=${encodeURIComponent(error)}`,
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard/social?error=missing_parameters", process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Determine platform from referrer or store in state
    const platformId = searchParams.get("platform") || "facebook";

    // Exchange code for tokens
    const tokenUrl = getTokenEndpoint(platformId);
    const clientId = getClientId(platformId);
    const clientSecret = getClientSecret(platformId);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback`,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Token exchange error:", error);
      return NextResponse.redirect(
        new URL(
          `/dashboard/social?error=${encodeURIComponent("token_exchange_failed")}`,
          process.env.NEXT_PUBLIC_APP_URL
        )
      );
    }

    const tokens = await tokenResponse.json();

    // Fetch profile info
    const profileData = await fetchProfile(platformId, tokens.access_token);

    // Save to Firestore
    await saveSocialPlatform(state, platformId, {
      name: getPlatformName(platformId),
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      username: profileData.username,
      profileId: profileData.profileId,
      followers: profileData.followers,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard/social?success=connected_${platformId}`,
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/social?error=${encodeURIComponent("callback_failed")}`,
        process.env.NEXT_PUBLIC_APP_URL
      )
    );
  }
}

// /lib/social-media-api.ts
/**
 * Social Media API Integration Library
 * Handles publishing, scheduling, and metrics for all platforms
 */

export class FacebookAPI {
  constructor(private accessToken: string, private profileId: string) {}

  async publishPost(caption: string, imageUrl: string) {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${this.profileId}/media`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to publish post");
    const data = await response.json();
    return { postId: data.id, url: `https://instagram.com/p/${data.id}` };
  }

  async getMetrics(postId: string) {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${postId}?fields=like_count,comments_count,insights.metric(impressions,reach)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch metrics");
    return response.json();
  }

  async createAd(campaign: any) {
    // Facebook Ads API implementation
    const response = await fetch(
      `https://graph.facebook.com/v18.0/act_${this.profileId}/campaigns`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          name: campaign.name,
          objective: "LINK_CLICKS",
          status: "PAUSED",
          daily_budget: campaign.dailyBudget * 100, // Convert to cents
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to create ad campaign");
    return response.json();
  }
}

export class TwitterAPI {
  constructor(private accessToken: string) {}

  async publishPost(caption: string) {
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        text: caption,
      }),
    });

    if (!response.ok) throw new Error("Failed to publish tweet");
    const data = await response.json();
    return {
      postId: data.data.id,
      url: `https://twitter.com/user/status/${data.data.id}`,
    };
  }

  async getMetrics(tweetId: string) {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch metrics");
    return response.json();
  }
}

export class TikTokAPI {
  constructor(private accessToken: string, private openId: string) {}

  async publishPost(caption: string, videoUrl: string) {
    const response = await fetch("https://open.tiktokapis.com/v1/video/publish/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        data: {
          video_url: videoUrl,
          title: caption,
          disable_comment: false,
          disable_duet: false,
          disable_stitch: false,
        },
      }),
    });

    if (!response.ok) throw new Error("Failed to publish TikTok video");
    return response.json();
  }
}

// Firestore Schema Documentation
/*
FIRESTORE COLLECTION STRUCTURE:

users/{userId}/
  ├── profile (document)
  │   ├── email: string
  │   ├── storeName: string
  │   ├── createdAt: timestamp
  │   └── settings: object
  │
  ├── socialPlatforms/{platformId} (documents)
  │   ├── name: string
  │   ├── connected: boolean
  │   ├── accessToken: string (encrypted)
  │   ├── refreshToken: string (encrypted)
  │   ├── username: string
  │   ├── profileId: string
  │   ├── followers: string
  │   ├── metrics: { reach, engagement }
  │   ├── connectedAt: timestamp
  │   └── expiresAt: timestamp
  │
  ├── products/{productId} (documents)
  │   ├── name: string
  │   ├── description: string
  │   ├── price: number
  │   ├── image: string (URL)
  │   ├── images: array<string>
  │   ├── category: string
  │   ├── inventory: number
  │   ├── status: 'active' | 'inactive'
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
  │
  ├── socialPosts/{postId} (documents)
  │   ├── productIds: array<string>
  │   ├── platforms: array<string>
  │   ├── caption: string
  │   ├── scheduledFor: timestamp (optional)
  │   ├── status: 'draft' | 'scheduled' | 'published' | 'failed'
  │   ├── metrics: { views, clicks, conversions }
  │   ├── createdAt: timestamp
  │   ├── publishedAt: timestamp
  │   └── platformPosts: { [platformId]: { postId, url } }
  │
  ├── socialAds/{adId} (documents)
  │   ├── platform: string
  │   ├── productIds: array<string>
  │   ├── budget: number
  │   ├── dailyBudget: number
  │   ├── startDate: timestamp
  │   ├── endDate: timestamp
  │   ├── targetAudience: {
  │   │   ├── ageMin: number
  │   │   ├── ageMax: number
  │   │   ├── interests: array<string>
  │   │   └── locations: array<string>
  │   ├── status: 'draft' | 'active' | 'paused' | 'completed'
  │   ├── metrics: { impressions, clicks, spend, conversions, roas }
  │   ├── createdAt: timestamp
  │   └── platformCampaignId: string
  │
  ├── orders/{orderId} (documents)
  │   ├── productIds: array<string>
  │   ├── source: 'social' | 'direct' | 'email'
  │   ├── socialPostId: string (optional)
  │   ├── total: number
  │   ├── status: 'pending' | 'completed'
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
  │
  └── scheduledJobs/{jobId} (documents)
      ├── type: 'publish_post' | 'refresh_metrics'
      ├── userId: string
      ├── payload: object
      ├── scheduledFor: timestamp
      ├── status: 'pending' | 'completed' | 'failed'
      ├── createdAt: timestamp
      └── executedAt: timestamp
*/

// Helper functions
function getTokenEndpoint(platform: string): string {
  const endpoints: Record<string, string> = {
    facebook: "https://graph.instagram.com/v18.0/oauth/access_token",
    instagram: "https://graph.instagram.com/v18.0/oauth/access_token",
    twitter: "https://api.twitter.com/2/oauth2/token",
    tiktok: "https://open.tiktokapis.com/v1/oauth/token",
  };
  return endpoints[platform];
}

function getClientId(platform: string): string | undefined {
  const ids: Record<string, string | undefined> = {
    facebook: process.env.FACEBOOK_APP_ID,
    instagram: process.env.FACEBOOK_APP_ID,
    twitter: process.env.TWITTER_API_KEY,
    tiktok: process.env.TIKTOK_CLIENT_ID,
  };
  return ids[platform];
}

function getClientSecret(platform: string): string | undefined {
  const secrets: Record<string, string | undefined> = {
    facebook: process.env.FACEBOOK_APP_SECRET,
    instagram: process.env.FACEBOOK_APP_SECRET,
    twitter: process.env.TWITTER_API_SECRET,
    tiktok: process.env.TIKTOK_CLIENT_SECRET,
  };
  return secrets[platform];
}

function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    facebook: "Facebook",
    instagram: "Instagram",
    twitter: "X (Twitter)",
    tiktok: "TikTok",
  };
  return names[platform] || platform;
}

async function fetchProfile(platform: string, accessToken: string): Promise<any> {
  const endpoints: Record<string, string> = {
    facebook: "https://graph.instagram.com/v18.0/me?fields=id,username,name,followers_count",
    instagram: "https://graph.instagram.com/v18.0/me?fields=id,username,name,followers_count",
    twitter: "https://api.twitter.com/2/users/me?user.fields=username,name,public_metrics",
    tiktok: "https://open.tiktokapis.com/v1/user/info/?fields=open_id,display_name",
  };

  const response = await fetch(endpoints[platform], {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error("Failed to fetch profile");

  const data = await response.json();

  return {
    profileId: data.data?.id || data.open_id || data.id,
    username: data.data?.username || data.display_name || data.username || "Unknown",
    followers: (data.data?.followers_count || data.public_metrics?.followers_count || 0).toString(),
  };
}