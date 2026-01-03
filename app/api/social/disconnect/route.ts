
// /app/api/social/disconnect/route.ts
export async function POST_DISCONNECT(req: NextRequest) {
  try {
    const { userId, platformId } = await req.json();

    // Verify authorization (should match user making request)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Revoke token if necessary
    const platform = OAUTH_CONFIGS[platformId];
    if (platform.revokeEndpoint) {
      // Call platform's token revocation endpoint
      await fetch(platform.revokeEndpoint, {
        method: "POST",
        body: JSON.stringify({ token: decodedToken }),
      });
    }

    // Delete from Firestore
    // Implementation in firestore.ts deleteSocialPlatform()

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json({ error: "Disconnection failed" }, { status: 500 });
  }
}
