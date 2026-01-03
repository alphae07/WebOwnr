
// /app/api/social/metrics/route.ts
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const postId = searchParams.get("postId");

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    }

    // Get post details
    const post = await getSocialPost(userId, postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch metrics from each platform
    const metrics: Record<string, any> = {};
    const platforms = await getSocialPlatforms(userId);

    for (const platformId of post.platforms) {
      try {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform?.accessToken) continue;

        const platformMetrics = await fetchPlatformMetrics(
          platformId,
          platform.accessToken,
          post.platformPosts?.[platformId]?.postId
        );

        metrics[platformId] = platformMetrics;
      } catch (error) {
        console.error(`Failed to fetch metrics for ${platformId}:`, error);
      }
    }

    // Aggregate metrics
    const aggregated = {
      totalViews: Object.values(metrics).reduce((sum, m: any) => sum + (m.views || 0), 0),
      totalClicks: Object.values(metrics).reduce((sum, m: any) => sum + (m.clicks || 0), 0),
      totalEngagement: Object.values(metrics).reduce((sum, m: any) => sum + (m.engagement || 0), 0),
      platformMetrics: metrics,
    };

    // Update post metrics in Firestore
    await updatePostMetrics(userId, postId, {
      views: aggregated.totalViews,
      clicks: aggregated.totalClicks,
    });

    return NextResponse.json({
      success: true,
      metrics: aggregated,
    });
  } catch (error) {
    console.error("Metrics fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
