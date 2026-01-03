
// /components/social/HashtagRecommendations.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface HashtagRecommendationsProps {
  productName: string;
  category?: string;
  onSelect?: (hashtags: string[]) => void;
}

export default function HashtagRecommendations({
  productName,
  category,
  onSelect,
}: HashtagRecommendationsProps) {
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateHashtags = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/social/hashtags?productName=${encodeURIComponent(
          productName
        )}&category=${category || ""}`
      );

      if (!response.ok) throw new Error("Failed to generate hashtags");
      const data = await response.json();
      setHashtags(data.hashtags);
    } catch (error) {
      toast.error("Failed to generate hashtags");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashtags.join(" "));
    toast.success("Hashtags copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={generateHashtags}
          disabled={loading || !productName}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate Hashtags
        </Button>
        {hashtags.length > 0 && (
          <Button variant="outline" onClick={copyToClipboard} className="gap-2">
            <Copy className="w-4 h-4" />
            Copy All
          </Button>
        )}
      </div>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map(tag => (
            <div
              key={tag}
              className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/20 cursor-pointer transition"
              onClick={() =>
                onSelect?.([...hashtags.filter(h => h !== tag)])
              }
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
