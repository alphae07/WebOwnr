// /lib/scheduler.ts
/**
 * Post Scheduler using Bull Queue
 * Install: npm install bull redis
 */

import Queue from "bull";

const publishQueue = new Queue("post-publish", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

export async function schedulePost(
  userId: string,
  postId: string,
  scheduledTime: Date
) {
  const delay = scheduledTime.getTime() - Date.now();

  if (delay < 0) {
    throw new Error("Scheduled time must be in the future");
  }

  await publishQueue.add(
    { userId, postId },
    {
      delay,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );
}

publishQueue.process(async (job) => {
  const { userId, postId } = job.data;

  try {
    // Get post data from Firestore
    const post = await getSocialPost(userId, postId);
    if (!post) throw new Error("Post not found");

    // Get user's platforms
    const platforms = await getSocialPlatforms(userId);

    // Publish to each platform
    for (const platformId of post.platforms) {
      const platform = platforms.find(p => p.id === platformId);
      if (!platform?.accessToken) continue;

      try {
        // Publish based on platform
        await publishToSocialMedia(platformId, platform, post);
      } catch (error) {
        console.error(`Failed to publish to ${platformId}:`, error);
      }
    }

    // Update post status
    await updateSocialPost(userId, postId, {
      status: "published",
      publishedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    throw error;
  }
});
