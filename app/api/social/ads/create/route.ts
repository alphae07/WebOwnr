
// /app/api/social/ads/create/route.ts
export async function POST_ADS_CREATE(req: NextRequest) {
  try {
    const { userId, adData } = await req.json();
    const { platform, productIds, budget, dailyBudget, targetAudience, startDate, endDate } = adData;

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get user's platform credentials
    const userPlatforms = await getSocialPlatforms(userId);
    const selectedPlatform = userPlatforms.find(p => p.id === platform);

    if (!selectedPlatform || !selectedPlatform.connected || !selectedPlatform.accessToken) {
      return NextResponse.json({ error: "Platform not connected" }, { status: 400 });
    }

    // Create ad campaign on platform using user's credentials
    let campaignId: string;

    switch (platform) {
      case "facebook":
      case "instagram":
        const fbApi = new FacebookAPI(selectedPlatform.accessToken, selectedPlatform.profileId!);
        const fbCampaign = await fbApi.createAd({
          name: `Ad Campaign - ${new Date().toLocaleDateString()}`,
          dailyBudget,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
        campaignId = fbCampaign.id;
        break;

      case "twitter":
        // Twitter Ads implementation
        campaignId = await createTwitterAd(selectedPlatform.accessToken, {
          budget,
          dailyBudget,
          startDate,
          endDate,
        });
        break;

      case "tiktok":
        // TikTok Ads implementation
        campaignId = await createTikTokAd(selectedPlatform.accessToken, {
          budget,
          dailyBudget,
          startDate,
          endDate,
        });
        break;

      default:
        throw new Error("Unsupported platform");
    }

    // Save ad record to Firestore
    const adId = await createSocialAd(userId, {
      platform,
      productIds,
      budget,
      dailyBudget,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: Timestamp.fromDate(new Date(endDate)),
      targetAudience,
      status: "draft",
      metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0, roas: 0 },
      platformCampaignId: campaignId,
    });

    return NextResponse.json({
      success: true,
      adId,
      campaignId,
      message: "Ad campaign created successfully",
    });
  } catch (error) {
    console.error("Ad creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ad creation failed" },
      { status: 500 }
    );
  }
}
