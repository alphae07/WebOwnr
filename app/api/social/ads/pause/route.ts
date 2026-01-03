
// /app/api/social/ads/pause/route.ts
export async function POST_ADS_PAUSE(req: NextRequest) {
  try {
    const { userId, adId } = await req.json();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get ad details
    const ad = await getSocialAd(userId, adId);
    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    // Get platform and pause campaign
    const platforms = await getSocialPlatforms(userId);
    const platform = platforms.find(p => p.id === ad.platform);

    if (!platform?.accessToken) {
      return NextResponse.json({ error: "Platform disconnected" }, { status: 400 });
    }

    // Pause on platform
    await pausePlatformAd(platform.id, platform.accessToken, ad.platformCampaignId);

    // Update Firestore
    await updateSocialAd(userId, adId, { status: "paused" });

    return NextResponse.json({
      success: true,
      message: "Ad campaign paused successfully",
    });
  } catch (error) {
    console.error("Pause ad error:", error);
    return NextResponse.json({ error: "Failed to pause ad" }, { status: 500 });
  }
}
