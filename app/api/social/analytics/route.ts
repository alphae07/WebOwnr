
// /app/api/social/analytics/route.ts
export async function GET_ANALYTICS(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const period = searchParams.get("period") || "30"; // days

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all posts from period
    const posts = await getPostsInPeriod(userId, startDate);

    // Calculate analytics
    const analytics = {
      totalPosts: posts.length,
      totalReach: posts.reduce((sum, p) => sum + (p.metrics?.views || 0), 0),
      totalEngagement: posts.reduce((sum, p) => sum + (p.metrics?.clicks || 0), 0),
      averageEngagementRate: 0,
      topPost: null as any,
      postsByPlatform: {} as Record<string, number>,
      dailyData: [] as any[],
    };

    // Calculate engagement rate
    if (analytics.totalPosts > 0) {
      analytics.averageEngagementRate = analytics.totalEngagement / analytics.totalReach;
    }

    // Find top post
    analytics.topPost = posts.reduce((top, post) => {
      const engagement = (post.metrics?.clicks || 0) + (post.metrics?.views || 0);
      const topEngagement = (top?.metrics?.clicks || 0) + (top?.metrics?.views || 0);
      return engagement > topEngagement ? post : top;
    });

    // Posts by platform
    posts.forEach(post => {
      post.platforms.forEach((platform: string) => {
        analytics.postsByPlatform[platform] = (analytics.postsByPlatform[platform] || 0) + 1;
      });
    });

    // Generate daily data
    const dailyMap = new Map<string, { views: number; clicks: number }>();
    posts.forEach(post => {
      const dateKey = new Date(post.publishedAt?.toDate?.() || post.createdAt?.toDate?.())
        .toISOString()
        .split("T")[0];
      const existing = dailyMap.get(dateKey) || { views: 0, clicks: 0 };
      dailyMap.set(dateKey, {
        views: existing.views + (post.metrics?.views || 0),
        clicks: existing.clicks + (post.metrics?.clicks || 0),
      });
    });

    analytics.dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
