// /app/api/social/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase";
import { saveSocialPlatform } from "@/lib/firebase";

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

const OAUTH_CONFIGS: Record<string, any> = {
  facebook: {
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    tokenEndpoint: "https://graph.instagram.com/v18.0/oauth/access_token",
    scopes: ["instagram_business_manage_messages", "instagram_business_manage_comments"],
  },
  instagram: {
    clientId: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    tokenEndpoint: "https://graph.instagram.com/v18.0/oauth/access_token",
    scopes: ["instagram_business_content_publish", "instagram_business_manage_messages"],
  },
  twitter: {
    clientId: process.env.TWITTER_API_KEY,
    clientSecret: process.env.TWITTER_API_SECRET,
    tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.write", "tweet.read", "users.read"],
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    tokenEndpoint: "https://open.tiktokapis.com/v1/oauth/token",
    scopes: ["video.upload", "user.info.basic"],
  },
};

export async function POST(req: NextRequest) {
  try {
    const { platformId, code } = await req.json();

    // Verify user authentication
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const config = OAUTH_CONFIGS[platformId];
    if (!config) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback`,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokens: OAuthTokens = await tokenResponse.json();

    // Fetch user profile information
    const profileData = await fetchPlatformProfile(platformId, tokens.accessToken);

    // Save to Firestore
    await saveSocialPlatform(userId, platformId, {
      name: getPlatformName(platformId),
      connected: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || null,
      username: profileData.username,
      profileId: profileData.profileId,
      followers: profileData.followers,
      expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : null,
    });

    return NextResponse.json({
      success: true,
      message: `${getPlatformName(platformId)} connected successfully`,
    });
  } catch (error) {
    console.error("Connection error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Connection failed" },
      { status: 500 }
    );
  }
}
