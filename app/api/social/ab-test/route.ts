
// /app/api/social/ab-test/route.ts
export async function POST(req: NextRequest) {
  try {
    const { userId, postId, variants } = await req.json();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create A/B test
    const testId = await createABTest(userId, {
      postId,
      variants,
      status: "active",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      testId,
      message: "A/B test created successfully",
    });
  } catch (error) {
    console.error("A/B test error:", error);
    return NextResponse.json({ error: "Failed to create A/B test" }, { status: 500 });
  }
}

