// /app/api/social/schedule/route.ts
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { userId, scheduleData } = await req.json();
    const { productIds, platforms, caption, scheduledFor } = scheduleData;

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const scheduledTime = new Date(scheduledFor);
    if (scheduledTime <= new Date()) {
      return NextResponse.json(
        { error: "Scheduled time must be in the future" },
        { status: 400 }
      );
    }

    // Create scheduled post in Firestore
    const postId = await createSocialPost(userId, {
      productIds,
      platforms,
      caption,
      scheduledFor: Timestamp.fromDate(scheduledTime),
      status: "scheduled",
      metrics: { views: 0, clicks: 0, conversions: 0 },
    });

    // Queue job for scheduling service (e.g., Cloud Tasks, Bull, etc.)
    await queueScheduledPost(userId, postId, scheduledTime);

    return NextResponse.json({
      success: true,
      postId,
      message: "Post scheduled successfully",
      scheduledFor: scheduledTime.toISOString(),
    });
  } catch (error) {
    console.error("Schedule error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scheduling failed" },
      { status: 500 }
    );
  }
}
