// /components/social/SocialMediaModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

interface SocialMediaModalProps {
  platformId?: string;
  mode?: "connect" | "share";
  productIds?: string[];
  onClose: () => void;
}

export default function SocialMediaModal({
  platformId,
  mode = "connect",
  productIds = [],
  onClose,
}: SocialMediaModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [step, setStep] = useState<"select" | "preview" | "success">("select");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const platforms = [
    { id: "facebook", name: "Facebook", icon: "f" },
    { id: "instagram", name: "Instagram", icon: "📷" },
    { id: "twitter", name: "X (Twitter)", icon: "𝕏" },
    { id: "tiktok", name: "TikTok", icon: "🎵" },
  ];

  const handleConnect = async () => {
    if (!platformId) return;

    setLoading(true);
    try {
      // Redirect to OAuth authorization URL
      const authUrl = getOAuthUrl(platformId);
      window.location.href = authUrl;
    } catch (error) {
      toast.error("Failed to initiate connection");
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.error("Please log in to share products");
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/social/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          userId: user?.uid,
          postData: {
            productIds,
            platforms: selectedPlatforms,
            caption: caption || "Check out these amazing products!",
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to share");

      const result = await response.json();
      
      // Check for any failures
      const failures = Object.entries(result.results).filter(
        ([_, r]: any) => !r.success
      );

      if (failures.length > 0) {
        toast.error(
          `Failed to share on ${failures.map(([p]) => p).join(", ")}`
        );
      } else {
        toast.success("Products shared successfully!");
        setStep("success");
        setTimeout(onClose, 2000);
      }
    } catch (error) {
      toast.error("Failed to share products");
    } finally {
      setLoading(false);
    }
  };

  const getOAuthUrl = (platform: string): string => {
    const configs: Record<string, any> = {
      facebook: {
        endpoint: "https://www.facebook.com/v18.0/dialog/oauth",
        clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        scope: "instagram_business_manage_messages,instagram_business_manage_comments",
      },
      instagram: {
        endpoint: "https://api.instagram.com/oauth/authorize",
        clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        scope: "instagram_business_content_publish,instagram_business_manage_messages",
      },
      twitter: {
        endpoint: "https://twitter.com/i/oauth2/authorize",
        clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
        scope: "tweet.write tweet.read users.read",
      },
      tiktok: {
        endpoint: "https://www.tiktok.com/v1/oauth/authorize",
        clientId: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID,
        scope: "video.upload user.info.basic",
      },
    };

    const config = configs[platform];
    const params = new URLSearchParams({
      client_id: config.clientId!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback`,
      response_type: "code",
      scope: config.scope,
      state: user?.uid || "state",
    });

    return `${config.endpoint}?${params.toString()}`;
  };

  if (mode === "connect") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Connect {platformId?.toUpperCase()}</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Connect your {platformId} account to start sharing products and running ads.
          </p>

          <Button
            onClick={handleConnect}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Account"
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            You'll be redirected to {platformId} to authorize the connection.
            Your access token will be encrypted and stored securely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {step === "select" && "Share Products"}
            {step === "preview" && "Review Your Post"}
            {step === "success" && "Success!"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "select" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">Select Platforms</label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() =>
                      setSelectedPlatforms(prev =>
                        prev.includes(platform.id)
                          ? prev.filter(id => id !== platform.id)
                          : [...prev, platform.id]
                      )
                    }
                    className={`p-3 rounded-lg border-2 transition ${
                      selectedPlatforms.includes(platform.id)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{platform.icon}</div>
                    <div className="font-medium text-sm">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Caption (Optional)</label>
              <Textarea
                placeholder="Add a caption to your post..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => setStep("preview")}
                disabled={selectedPlatforms.length === 0}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Platforms:</p>
              <div className="flex flex-wrap gap-2">
                {selectedPlatforms.map(id => (
                  <span key={id} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                    {platforms.find(p => p.id === id)?.name}
                  </span>
                ))}
              </div>
            </div>

            {caption && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Caption:</p>
                <p className="text-sm">{caption}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleShare}
                disabled={loading}
                className="flex-1 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  "Share Now"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Products Shared!</h3>
              <p className="text-sm text-muted-foreground">
                Your products have been successfully shared to the selected platforms.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
