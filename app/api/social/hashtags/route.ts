
// /app/api/social/hashtags/route.ts
export async function GET_HASHTAGS(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productName = searchParams.get("productName");
    const category = searchParams.get("category");

    if (!productName) {
      return NextResponse.json({ error: "Product name required" }, { status: 400 });
    }

    // Generate hashtag recommendations using AI or predefined patterns
    const hashtags = generateHashtags(productName, category);

    return NextResponse.json({
      success: true,
      hashtags,
    });
  } catch (error) {
    console.error("Hashtags error:", error);
    return NextResponse.json({ error: "Failed to generate hashtags" }, { status: 500 });
  }
}
