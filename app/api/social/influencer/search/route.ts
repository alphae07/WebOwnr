// /app/api/social/influencer/search/route.ts
export async function GET_INFLUENCERS(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const minFollowers = searchParams.get("minFollowers") || "10000";

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Search influencers in database
    const influencers = await searchInfluencers({
      category,
      minFollowers: parseInt(minFollowers),
    });

    return NextResponse.json({
      success: true,
      influencers,
    });
  } catch (error) {
    console.error("Influencer search error:", error);
    return NextResponse.json({ error: "Failed to search influencers" }, { status: 500 });
  }
}

