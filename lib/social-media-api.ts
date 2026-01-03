// /lib/social-media-api.ts
/**
 * Comprehensive Social Media API Integration
 * Each platform uses the user's own OAuth token to post
 */

export class FacebookAPI {
  constructor(private accessToken: string, private profileId: string) {}

  async publishPost(caption: string, imageUrl: string) {
    try {
      const response = await fetch(
        `https://graph.instagram.com/v18.0/${this.profileId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to publish post");
      }

      const data = await response.json();
      
      // Publish the media (two-step process)
      const publishResponse = await fetch(
        `https://graph.instagram.com/v18.0/${this.profileId}/media_publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            creation_id: data.id,
          }),
        }
      );

      if (!publishResponse.ok) {
        throw new Error("Failed to publish media");
      }

      const publishData = await publishResponse.json();
      return {
        postId: publishData.id,
        url: `https://instagram.com/p/${publishData.id}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMetrics(mediaId: string) {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${mediaId}?fields=like_count,comments_count,media_product_type`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch metrics");
    const data = await response.json();

    return {
      views: data.impressions || 0,
      clicks: data.clicks || 0,
      likes: data.like_count || 0,
      comments: data.comments_count || 0,
    };
  }

  async createAd(campaign: {
    name: string;
    dailyBudget: number;
    startDate: Date;
    endDate: Date;
  }) {
    // Facebook Ads Manager API
    // Requires additional permissions: ads_management
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/act_${this.profileId}/campaigns`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: new URLSearchParams({
          name: campaign.name,
          objective: "LINK_CLICKS",
          status: "PAUSED",
          daily_budget: (campaign.dailyBudget * 100).toString(),
          start_time: Math.floor(campaign.startDate.getTime() / 1000).toString(),
          stop_time: Math.floor(campaign.endDate.getTime() / 1000).toString(),
        }).toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create campaign");
    }

    return response.json();
  }
}

export class TwitterAPI {
  constructor(private accessToken: string, private userId?: string) {}

  async publishPost(caption: string, imageUrl?: string) {
    try {
      const body: any = { text: caption };

      // If image provided, upload and attach
      if (imageUrl) {
        const mediaId = await this.uploadMedia(imageUrl);
        body.reply = {
          media: { media_ids: [mediaId] },
        };
      }

      const response = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to publish tweet");
      }

      const data = await response.json();
      return {
        postId: data.data.id,
        url: `https://twitter.com/user/status/${data.data.id}`,
      };
    } catch (error) {
      throw error;
    }
  }

  private async uploadMedia(imageUrl: string): Promise<string> {
    // Convert image to base64
    const imageBuffer = await fetch(imageUrl).then(r => r.arrayBuffer());
    const base64 = Buffer.from(imageBuffer).toString("base64");

    const response = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: new URLSearchParams({
        media_data: base64,
      }).toString(),
    });

    if (!response.ok) throw new Error("Failed to upload media");
    const data = await response.json();
    return data.media_id_string;
  }

  async getMetrics(tweetId: string) {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch metrics");
    const data = await response.json();
    const metrics = data.data.public_metrics;

    return {
      views: metrics.impression_count || 0,
      clicks: metrics.bookmark_count + metrics.like_count || 0,
      likes: metrics.like_count || 0,
      retweets: metrics.retweet_count || 0,
      replies: metrics.reply_count || 0,
    };
  }
}

export class TikTokAPI {
  constructor(private accessToken: string, private openId: string) {}

  async publishPost(caption: string, videoUrl: string) {
    // TikTok requires video to be uploaded first
    try {
      const response = await fetch(
        "https://open.tiktokapis.com/v1/video/publish/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify({
            data: {
              video_url: videoUrl,
              title: caption,
              disable_comment: false,
              disable_duet: false,
              disable_stitch: false,
              privacy_level: "PUBLIC_TO_EVERYONE",
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to publish video");
      }

      const data = await response.json();
      return {
        postId: data.data.video_id,
        url: `https://www.tiktok.com/@${this.openId}/video/${data.data.video_id}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMetrics(videoId: string) {
    const response = await fetch(
      `https://open.tiktokapis.com/v1/video/query/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          filters: {
            video_ids: [videoId],
          },
          fields: [
            "view_count",
            "like_count",
            "comment_count",
            "share_count",
          ],
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch metrics");
    const data = await response.json();
    const video = data.data.videos[0];

    return {
      views: video.view_count || 0,
      clicks: video.like_count + video.share_count || 0,
      likes: video.like_count || 0,
      comments: video.comment_count || 0,
      shares: video.share_count || 0,
    };
  }
}

export class LinkedInAPI {
  constructor(private accessToken: string, private profileId: string) {}

  async publishPost(caption: string, imageUrl?: string) {
    try {
      const response = await fetch(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.accessToken}`,
            "LinkedIn-Version": "202401",
          },
          body: JSON.stringify({
            author: `urn:li:person:${this.profileId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareMediaCategory: imageUrl ? "IMAGE" : "NONE",
                shareCommentary: {
                  text: caption,
                },
                media: imageUrl
                  ? [
                      {
                        media: imageUrl,
                        status: "READY",
                      },
                    ]
                  : [],
              },
            },
            visibility: {
              "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to publish post");
      }

      const data = await response.json();
      return {
        postId: data.id,
        url: `https://www.linkedin.com/feed/update/${data.id}/`,
      };
    } catch (error) {
      throw error;
    }
  }
}